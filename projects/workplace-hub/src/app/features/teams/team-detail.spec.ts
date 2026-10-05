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
import { TeamDetail } from './team-detail';
import {
    MockRepository,
    REPOSITORY,
} from '../../core/mock-http/mock-repository';
import { DemoContext } from '../../core/mock-http/context';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { demoContextProviders } from '../../testing/demo-providers';

it('retains an authorized team transfer draft across read/save failures, retries and hides it on identity changes', async () => {
    const repo = new MockRepository();
    let writes = 0;
    TestBed.configureTestingModule({
        imports: [TeamDetail],
        providers: [
            provideRouter([]),
            ...demoContextProviders(),
            { provide: REPOSITORY, useValue: repo },
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const context = inject(DemoContext),
                            actor = inject(Session).identity();
                        if (inject(Scenario).mode() === 'error')
                            return throwError(
                                () =>
                                    new HttpErrorResponse({
                                        status: 503,
                                        error: {
                                            message: 'Temporary team failure.',
                                        },
                                    }),
                            );
                        const key = context.key();
                        if (request.url === '/api/people-options')
                            return of(
                                new HttpResponse({
                                    body: {
                                        items: repo.people(actor),
                                        contextKey: key,
                                    },
                                }),
                            );
                        if (request.url === '/api/teams')
                            return of(
                                new HttpResponse({
                                    body: {
                                        items: repo.teams(actor),
                                        contextKey: key,
                                    },
                                }),
                            );
                        if (request.method === 'POST') {
                            writes++;
                            return of(
                                new HttpResponse({
                                    body: {
                                        record: repo.transfer(
                                            'T001',
                                            request.body,
                                            actor,
                                        ),
                                        contextKey: key,
                                    },
                                }),
                            );
                        }
                        return of(
                            new HttpResponse({
                                body: {
                                    record: repo.team('T001', actor),
                                    contextKey: key,
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
    const f = TestBed.createComponent(TeamDetail);
    f.componentRef.setInput('id', 'T001');
    await f.whenStable();
    const page = f.componentInstance;
    expect(page.options().some((o) => o.value === 'P002')).toBe(false);
    page.form.controls.personId.setValue('P026');
    page.form.markAsDirty();
    TestBed.inject(Scenario).select('error');
    await f.whenStable();
    expect(page.view()?.team.id).toBe('T001');
    expect(f.nativeElement.querySelector('#transfer-person').value).toBe(
        'P026',
    );
    page.transfer();
    await f.whenStable();
    expect(page.mutation.error()).toBe('Temporary team failure.');
    expect(page.form.dirty).toBe(true);
    expect(writes).toBe(0);
    TestBed.inject(Scenario).retry();
    await f.whenStable();
    page.transfer();
    await f.whenStable();
    expect(writes).toBe(1);
    expect(repo.person('P026', session.identity()).person.teamId).toBe('T001');
    expect(page.form.pristine).toBe(true);
    session.select('P001');
    expect(page.view()).toBeUndefined();
    expect(page.options()).toHaveLength(0);
    await f.whenStable();
    expect(f.nativeElement.querySelector('#transfer-person')).toBeNull();
});
