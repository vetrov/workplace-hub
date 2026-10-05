import {
    HttpClient,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RecordResult, SupplierDetail } from 'domain';
import {
    DEMO_SESSION,
    REPOSITORY,
    MockRepository,
    SCENARIO_CONTEXT,
} from './mock-repository';
import { mockInterceptor } from './mock.interceptor';
import { Session } from '../session/session';
import { Scenario } from '../scenarios/scenario';
import { BROWSER_STORAGE } from '../storage';

const supplier = {
    name: 'Nordic Devices',
    contactName: 'Dana Smith',
    email: 'dana@nordic.example',
    phone: '',
    notes: '',
};

describe('administration HTTP context and commit timing', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([mockInterceptor])),
                { provide: BROWSER_STORAGE, useValue: null },
                { provide: REPOSITORY, useValue: new MockRepository() },
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
            ],
        });
        TestBed.inject(Session).select('P013');
    });
    afterEach(() => vi.useRealTimers());

    it('captures a supplier command snapshot and commits exactly once at completion', async () => {
        const input = { ...supplier };
        const result = firstValueFrom(
            TestBed.inject(HttpClient).post<RecordResult<SupplierDetail>>(
                '/api/suppliers',
                input,
            ),
        );
        input.name = 'Mutated after dispatch';
        expect(TestBed.inject(REPOSITORY).data.suppliers).toHaveLength(40);
        await vi.advanceTimersByTimeAsync(250);
        expect((await result).record.name).toBe('Nordic Devices');
        expect(TestBed.inject(REPOSITORY).data.suppliers).toHaveLength(41);
    });

    it.each(['reset', 'identity'])(
        'cancels a delayed supplier save on %s',
        async (change) => {
            TestBed.inject(Scenario).select('delayed');
            const result = firstValueFrom(
                TestBed.inject(HttpClient).post('/api/suppliers', supplier),
            ).catch((e) => e);
            if (change === 'reset') TestBed.inject(Scenario).reset();
            else TestBed.inject(Session).select('P025');
            await vi.advanceTimersByTimeAsync(2000);
            expect(await result).toMatchObject({ status: 409 });
            expect(TestBed.inject(REPOSITORY).data.suppliers).toHaveLength(40);
        },
    );

    it('does not commit an unsubscribed policy update', async () => {
        const repo = TestBed.inject(REPOSITORY),
            original = repo.policy(
                'POL-equipment',
                TestBed.inject(Session).identity(),
            );
        const subscription = TestBed.inject(HttpClient)
            .patch('/api/policies/POL-equipment', {
                ...original,
                maximumTotal: 100,
            })
            .subscribe();
        subscription.unsubscribe();
        await vi.advanceTimersByTimeAsync(250);
        expect(
            repo.policy(original.id, TestBed.inject(Session).identity()),
        ).toBe(original);
    });

    it.each([
        ['empty', 409],
        ['error', 503],
    ] as const)(
        'prevents administration writes in %s mode',
        async (mode, status) => {
            TestBed.inject(Scenario).select(mode);
            const result = firstValueFrom(
                TestBed.inject(HttpClient).post('/api/suppliers', supplier),
            ).catch((e) => e);
            await vi.advanceTimersByTimeAsync(250);
            expect(await result).toMatchObject({ status });
            expect(TestBed.inject(REPOSITORY).data.suppliers).toHaveLength(40);
        },
    );
});
