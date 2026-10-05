import { inject, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    HttpErrorResponse,
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { routes } from '../app.routes';
import { unsavedChangesGuard } from '../core/workflow-guards';
import { DemoContext } from '../core/mock-http/context';
import { MockRepository } from '../core/mock-http/mock-repository';
import { Session } from '../core/session/session';
import { Scenario } from '../core/scenarios/scenario';
import { RequestWizard } from '../features/requests/request-wizard';
import { AssetCreate } from '../features/assets/asset-create';
import { demoContextProviders } from './demo-providers';

const definitions = [
    {
        title: 'request',
        component: RequestWizard,
        actor: 'P025',
        target: '/requests',
    },
    {
        title: 'asset',
        component: AssetCreate,
        actor: 'P013',
        target: '/assets',
    },
] as const;

async function setup(
    component: Type<RequestWizard | AssetCreate>,
    actor: string,
) {
    const repo = new MockRepository(),
        posts: Subject<HttpResponse<unknown>>[] = [];
    let failRead = false,
        failWrite = false;
    TestBed.configureTestingModule({
        imports: [component],
        providers: [
            ...demoContextProviders(),
            provideRouter([]),
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const key = inject(DemoContext).key(),
                            identity = inject(Session).identity();
                        if (request.method === 'POST') {
                            const pending = new Subject<
                                HttpResponse<unknown>
                            >();
                            posts.push(pending);
                            return failWrite
                                ? throwError(
                                      () =>
                                          new HttpErrorResponse({
                                              status: 503,
                                              error: {
                                                  message:
                                                      'Temporary creation failure.',
                                              },
                                          }),
                                  )
                                : pending;
                        }
                        if (request.url === '/api/supplier-options' && failRead)
                            return throwError(
                                () =>
                                    new HttpErrorResponse({
                                        status: 503,
                                        error: {
                                            message:
                                                'Temporary supplier failure.',
                                        },
                                    }),
                            );
                        return of(
                            new HttpResponse({
                                body:
                                    request.url === '/api/organization'
                                        ? {
                                              record: repo.organization(
                                                  identity,
                                              ),
                                              contextKey: key,
                                          }
                                        : {
                                              items: [
                                                  {
                                                      id: 'S001',
                                                      name: 'Northstar',
                                                  },
                                              ],
                                              contextKey: key,
                                          },
                            }),
                        );
                    },
                ]),
            ),
        ],
    });
    TestBed.inject(Session).select(actor);
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const navigate = vi
        .spyOn(TestBed.inject(Router), 'navigate')
        .mockImplementation(async () => {
            expect(page.mutation.busy()).toBe(false);
            expect(page.canLeave()).toBe(true);
            return true;
        });
    const fill = () => {
        if (page instanceof RequestWizard)
            page.form.patchValue({
                title: 'Navigation request',
                justification: 'A replacement for daily development.',
                delivery: { location: 'Helsinki', neededBy: '2026-12-01' },
                items: [
                    { description: 'Computer', quantity: 1, unitCost: 100 },
                ],
            });
        else
            page.form.patchValue({
                name: 'Navigation computer',
                serialNumber: 'NAV-001',
                supplierId: 'S001',
            });
    };
    return {
        fixture,
        page,
        posts,
        navigate,
        fill,
        failReads: () => {
            failRead = true;
        },
        failWrites: (value: boolean) => {
            failWrite = value;
        },
        resolve: () => {
            posts.at(-1)!.next(
                new HttpResponse({
                    body: {
                        record: {
                            id:
                                page instanceof RequestWizard
                                    ? 'R0251'
                                    : 'A2001',
                        },
                        contextKey: TestBed.inject(DemoContext).key(),
                    },
                }),
            );
            posts.at(-1)!.complete();
        },
    };
}

function save(page: RequestWizard | AssetCreate): void {
    if (page instanceof RequestWizard) page.save('draft');
    else page.save();
}

for (const definition of definitions) {
    describe(`${definition.title} editor navigation`, () => {
        it('protects dirty inputs, blocks pristine pending/duplicate saves and permits success navigation', async () => {
            const state = await setup(definition.component, definition.actor),
                { page, fixture } = state;
            const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
            expect(page.canLeave()).toBe(true);
            state.fill();
            page.form.markAsDirty();
            expect(page.canLeave()).toBe(false);
            expect(confirm).toHaveBeenCalledTimes(1);
            confirm.mockReturnValue(true);
            expect(page.canLeave()).toBe(true);
            page.form.markAsPristine();
            confirm.mockClear();
            save(page);
            TestBed.tick();
            fixture.detectChanges();
            save(page);
            expect(state.posts.length).toBe(1);
            expect(page.canLeave()).toBe(false);
            expect(confirm).not.toHaveBeenCalled();
            expect(page.form.disabled).toBe(true);
            state.resolve();
            await fixture.whenStable();
            expect(state.navigate).toHaveBeenCalledOnce();
            expect(page.form.pristine).toBe(true);
            confirm.mockRestore();
        });

        it('retains failed creation values and loaded choices, retries unchanged inputs and clears reset state', async () => {
            const state = await setup(definition.component, definition.actor),
                { page, fixture } = state;
            state.fill();
            page.form.markAsDirty();
            state.failReads();
            state.failWrites(true);
            TestBed.inject(Scenario).select('error');
            await fixture.whenStable();
            if (page instanceof AssetCreate)
                expect(page.supplierOptions().map((s) => s.id)).toContain(
                    'S001',
                );
            save(page);
            await fixture.whenStable();
            expect(page.mutation.error()).toBe('Temporary creation failure.');
            expect(page.form.dirty).toBe(true);
            const values = page.form.getRawValue();
            state.failWrites(false);
            save(page);
            TestBed.tick();
            fixture.detectChanges();
            expect(state.posts.length).toBe(2);
            expect(page.form.getRawValue()).toEqual(values);
            state.resolve();
            await fixture.whenStable();
            expect(state.navigate).toHaveBeenCalledOnce();
            state.fill();
            page.form.markAsDirty();
            TestBed.inject(Scenario).reset();
            await fixture.whenStable();
            expect(page.form.pristine).toBe(true);
            expect(
                page instanceof RequestWizard
                    ? page.form.controls.title.value
                    : page.form.controls.name.value,
            ).toBe('');
        });

        it('cancels pending creation on identity and reset without stale success navigation', async () => {
            const state = await setup(definition.component, definition.actor),
                { page, fixture } = state;
            state.fill();
            save(page);
            TestBed.tick();
            fixture.detectChanges();
            expect(state.posts[0].observed).toBe(true);
            TestBed.inject(Session).select(
                definition.actor === 'P025' ? 'P001' : 'P025',
            );
            await fixture.whenStable();
            expect(state.posts[0].observed).toBe(false);
            expect(page.mutation.busy()).toBe(false);
            TestBed.inject(Session).select(definition.actor);
            await fixture.whenStable();
            state.fill();
            save(page);
            TestBed.tick();
            fixture.detectChanges();
            TestBed.inject(Scenario).reset();
            await fixture.whenStable();
            expect(state.posts[1].observed).toBe(false);
            expect(state.navigate).not.toHaveBeenCalled();
            expect(page.canLeave()).toBe(true);
        });
    });
}

it('guards creation navigation on both routed editors', () => {
    expect(
        routes.find((r) => r.path === 'assets/new')?.canDeactivate,
    ).toContain(unsavedChangesGuard);
    expect(
        routes.find((r) => r.path === 'requests/new')?.canDeactivate,
    ).toContain(unsavedChangesGuard);
});
