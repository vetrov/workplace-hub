import {
    HttpErrorResponse,
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReportDetail } from './report-detail';
import { MockRepository } from '../../core/mock-http/mock-repository';
import { DemoContext } from '../../core/mock-http/context';
import { Session } from '../../core/session/session';
import { demoContextProviders } from '../../testing/demo-providers';

it('uses resolved input, clears obsolete contexts synchronously and handles reused detail IDs', async () => {
    const repo = new MockRepository();
    TestBed.configureTestingModule({
        imports: [ReportDetail],
        providers: [
            provideRouter([]),
            ...demoContextProviders(),
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const context = inject(DemoContext),
                            actor = inject(Session).identity();
                        if (request.url === '/api/organization')
                            return of(
                                new HttpResponse({
                                    body: {
                                        record: repo.organization(actor),
                                        contextKey: context.key(),
                                    },
                                }),
                            );
                        if (actor.role === 'manager')
                            return throwError(
                                () =>
                                    new HttpErrorResponse({
                                        status: 403,
                                        error: {
                                            message: 'Report access denied.',
                                        },
                                    }),
                            );
                        return of(
                            new HttpResponse({
                                body: {
                                    record: repo.report(
                                        request.url.split('/').at(-1)!,
                                        actor,
                                    ),
                                    contextKey: context.key(),
                                },
                            }),
                        );
                    },
                ]),
            ),
        ],
    });
    const session = TestBed.inject(Session);
    session.select('P013');
    const context = TestBed.inject(DemoContext),
        f = TestBed.createComponent(ReportDetail);
    f.componentRef.setInput('id', 'REP003');
    f.componentRef.setInput('resolved', {
        kind: 'ready',
        contextKey: context.key(),
        run: repo.report('REP003', session.identity()),
    });
    await f.whenStable();
    expect(f.componentInstance.run()?.total).toBe(2000);
    session.select('P001');
    expect(f.componentInstance.run()).toBeUndefined();
    await f.whenStable();
    expect(f.componentInstance.error()).toBe('Report access denied.');
    session.select('P013');
    await f.whenStable();
    f.componentRef.setInput('id', 'REP004');
    f.componentRef.setInput('resolved', {
        kind: 'ready',
        contextKey: context.key(),
        run: repo.report('REP004', session.identity()),
    });
    await f.whenStable();
    expect(f.componentInstance.run()?.report.id).toBe('REP004');
    expect(f.nativeElement.querySelector('h1').textContent).toBe(
        'Approved requests',
    );
});
