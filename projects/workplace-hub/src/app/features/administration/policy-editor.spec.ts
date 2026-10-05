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
import { PurchasingPolicy } from 'domain';
import { PolicyEditor } from './policy-editor';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { DemoContext } from '../../core/mock-http/context';
import {
    DEMO_SESSION,
    SCENARIO_CONTEXT,
} from '../../core/mock-http/mock-repository';
import { BROWSER_STORAGE } from '../../core/storage';

it('retries a failed Signal Forms save with unchanged values and retains dirty state until success', async () => {
    let record: PurchasingPolicy = {
        id: 'POL-equipment',
        name: 'Equipment policy',
        category: 'equipment',
        maximumTotal: 50000,
        enabled: true,
        notes: '',
        version: 1,
    };
    let writes = 0;
    TestBed.configureTestingModule({
        imports: [PolicyEditor],
        providers: [
            provideRouter([]),
            { provide: BROWSER_STORAGE, useValue: null },
            {
                provide: DEMO_SESSION,
                useFactory: () => {
                    const session = inject(Session);
                    return () => ({
                        identity: session.identity(),
                        epoch: session.epoch(),
                    });
                },
            },
            {
                provide: SCENARIO_CONTEXT,
                useFactory: () => {
                    const scenario = inject(Scenario);
                    return () => ({
                        mode: scenario.mode(),
                        generation: scenario.generation(),
                    });
                },
            },
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const key = inject(DemoContext).key();
                        if (request.method === 'PATCH') {
                            writes++;
                            if (writes === 1)
                                return throwError(
                                    () =>
                                        new HttpErrorResponse({
                                            status: 503,
                                            error: {
                                                message:
                                                    'Temporary demo failure.',
                                            },
                                        }),
                                );
                            record = {
                                ...record,
                                ...(request.body as object),
                                version: 2,
                            };
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
    const fixture = TestBed.createComponent(PolicyEditor);
    fixture.componentRef.setInput('id', record.id);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.loaded()).toBe(true);
    expect(fixture.nativeElement.querySelector('#policy-category').value).toBe(
        'equipment',
    );
    page.policyForm.maximumTotal().controlValue.set(100);
    await page.save(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(page.policyForm().getError('save')?.message).toBe(
        'Temporary demo failure.',
    );
    expect(page.model().maximumTotal).toBe(100);
    expect(page.policyForm().dirty()).toBe(true);
    await page.save(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(writes).toBe(2);
    expect(record.maximumTotal).toBe(100);
    expect(record.version).toBe(2);
    expect(page.policyForm().dirty()).toBe(false);
    expect(page.feedback()).toBe('Policy saved. Version 2.');
});
