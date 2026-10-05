import {
    HttpErrorResponse,
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AssetDetail } from 'domain';
import { AssetEditor } from './asset-editor';
import { DemoContext } from '../../core/mock-http/context';
import { MockRepository } from '../../core/mock-http/mock-repository';
import { DEMO_IDENTITIES } from '../../core/mock-http/seed-data';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { demoContextProviders } from '../../testing/demo-providers';

it('retains failed inventory edits, retries unchanged inputs and clears on identity/reset', async () => {
    let record = new MockRepository().asset('A0001', DEMO_IDENTITIES[2]),
        writes = 0;
    TestBed.configureTestingModule({
        imports: [AssetEditor],
        providers: [
            provideRouter([]),
            ...demoContextProviders(),
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const key = inject(DemoContext).key();
                        if (request.url === '/api/supplier-options')
                            return of(
                                new HttpResponse({
                                    body: {
                                        items: [
                                            { id: 'S001', name: 'Northstar' },
                                        ],
                                        contextKey: key,
                                    },
                                }),
                            );
                        if (request.method === 'PATCH') {
                            writes++;
                            if (writes === 1)
                                return throwError(
                                    () =>
                                        new HttpErrorResponse({
                                            status: 503,
                                            error: {
                                                message:
                                                    'Temporary save failure.',
                                            },
                                        }),
                                );
                            record = {
                                ...record,
                                ...(request.body as object),
                                version: 2,
                            } as AssetDetail;
                        }
                        return of(
                            new HttpResponse({
                                body: { record, contextKey: key },
                            }),
                        );
                    },
                ]),
            ),
        ],
    });
    TestBed.inject(Session).select('P013');
    const f = TestBed.createComponent(AssetEditor);
    f.componentRef.setInput('id', record.id);
    await f.whenStable();
    const page = f.componentInstance;
    expect(page.editor.loaded()?.version).toBe(1);
    expect(page.form.pristine).toBe(true);
    page.form.controls.name.setValue('New asset title');
    page.form.markAsDirty();
    page.save();
    await f.whenStable();
    expect(page.mutation.error()).toBe('Temporary save failure.');
    expect(page.form.controls.name.value).toBe('New asset title');
    expect(page.form.dirty).toBe(true);
    page.save();
    await f.whenStable();
    expect(writes).toBe(2);
    expect(record.name).toBe('New asset title');
    expect(page.form.pristine).toBe(true);
    expect(page.editor.loaded()?.version).toBe(2);
    page.form.controls.name.setValue('Unsaved value');
    page.form.markAsDirty();
    TestBed.inject(Scenario).reset();
    await f.whenStable();
    expect(page.form.controls.name.value).toBe(record.name);
    TestBed.inject(Session).select('P025');
    await f.whenStable();
    expect(page.editor.loaded()).toBeUndefined();
    expect(page.form.controls.name.value).toBe('');
});

it('blocks duplicate inventory writes and navigation while a save is pending', async () => {
    const record = new MockRepository().asset('A0001', DEMO_IDENTITIES[2]),
        pending = new Subject<HttpResponse<unknown>>();
    let writes = 0;
    TestBed.configureTestingModule({
        imports: [AssetEditor],
        providers: [
            provideRouter([]),
            ...demoContextProviders(),
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const key = inject(DemoContext).key();
                        if (request.method === 'PATCH') {
                            writes++;
                            return pending;
                        }
                        return of(
                            new HttpResponse({
                                body:
                                    request.url === '/api/supplier-options'
                                        ? {
                                              items: [
                                                  {
                                                      id: 'S001',
                                                      name: 'Northstar',
                                                  },
                                              ],
                                              contextKey: key,
                                          }
                                        : { record, contextKey: key },
                            }),
                        );
                    },
                ]),
            ),
        ],
    });
    TestBed.inject(Session).select('P013');
    const f = TestBed.createComponent(AssetEditor);
    f.componentRef.setInput('id', record.id);
    await f.whenStable();
    const page = f.componentInstance;
    page.save();
    page.save();
    TestBed.tick();
    f.detectChanges();
    expect(writes).toBe(1);
    expect(page.canLeave()).toBe(false);
    expect(page.form.disabled).toBe(true);
    TestBed.inject(Session).select('P025');
    await f.whenStable();
    expect(page.mutation.busy()).toBe(false);
    expect(pending.observed).toBe(false);
    expect(page.editor.loaded()).toBeUndefined();
});
