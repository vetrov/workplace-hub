import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    HttpErrorResponse,
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReportCreate } from './report-create';
import { MockRepository } from '../../core/mock-http/mock-repository';
import { DemoContext } from '../../core/mock-http/context';
import { Session } from '../../core/session/session';
import { demoContextProviders } from '../../testing/demo-providers';

@Component({ template: '' })
class Target {}

it('loads organization defaults, validates dataset filters, retains failed inputs and saves once on retry', async () => {
    const repo = new MockRepository();
    let writes = 0;
    TestBed.configureTestingModule({
        imports: [ReportCreate],
        providers: [
            ...demoContextProviders(),
            provideRouter([{ path: 'reports/:id', component: Target }]),
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const context = inject(DemoContext),
                            actor = inject(Session).identity(),
                            key = context.key();
                        if (request.url === '/api/organization')
                            return of(
                                new HttpResponse({
                                    body: {
                                        record: {
                                            ...repo.organization(actor),
                                            defaultReportDataset: 'assets',
                                        },
                                        contextKey: key,
                                    },
                                }),
                            );
                        if (request.url === '/api/people-options')
                            return of(
                                new HttpResponse({
                                    body: {
                                        items: repo.people(actor),
                                        contextKey: key,
                                    },
                                }),
                            );
                        writes++;
                        if (writes === 1)
                            return throwError(
                                () =>
                                    new HttpErrorResponse({
                                        status: 503,
                                        error: {
                                            message:
                                                'Temporary report save failure.',
                                        },
                                    }),
                            );
                        return of(
                            new HttpResponse({
                                body: {
                                    record: repo.createReport(
                                        request.body,
                                        actor,
                                    ),
                                    contextKey: key,
                                },
                            }),
                        );
                    },
                ]),
            ),
        ],
    });
    TestBed.inject(Session).select('P001');
    const f = TestBed.createComponent(ReportCreate);
    await f.whenStable();
    const page = f.componentInstance;
    expect(page.form.controls.dataset.value).toBe('assets');
    expect(page.form.pristine).toBe(true);
    expect(
        page
            .personOptions()
            .every(
                (o) =>
                    repo
                        .people(TestBed.inject(Session).identity())
                        .find((p) => p.id === o.value)?.teamId === 'T001',
            ),
    ).toBe(true);
    page.form.controls.name.setValue('Team report');
    page.form.controls.status.setValue('approved');
    page.save();
    expect(writes).toBe(0);
    page.form.controls.status.setValue('assigned');
    page.form.markAsDirty();
    page.save();
    await f.whenStable();
    expect(page.mutation.error()).toBe('Temporary report save failure.');
    expect(page.form.dirty).toBe(true);
    page.save();
    await f.whenStable();
    expect(writes).toBe(2);
    expect(page.form.pristine).toBe(true);
    expect(TestBed.inject(Router).url).toBe('/reports/REP005');
    expect(
        repo.report('REP005', TestBed.inject(Session).identity()).report.status,
    ).toBe('assigned');
});
