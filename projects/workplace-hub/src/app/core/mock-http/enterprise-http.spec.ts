import {
    HttpClient,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RecordResult, SavedReport } from 'domain';
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

const report = {
    name: 'Filtered inventory',
    dataset: 'assets',
    status: 'available',
    personId: '',
};

describe('enterprise HTTP commit and context boundaries', () => {
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

    it('captures report filters and commits once after the timer', async () => {
        const body = { ...report },
            http = TestBed.inject(HttpClient),
            repo = TestBed.inject(REPOSITORY),
            actor = TestBed.inject(Session).identity();
        const result = firstValueFrom(
            http.post<RecordResult<SavedReport>>('/api/reports', body),
        );
        body.status = 'retired';
        expect(repo.reports(actor)).toHaveLength(4);
        await vi.advanceTimersByTimeAsync(250);
        expect((await result).record).toMatchObject({
            id: 'REP005',
            status: 'available',
        });
        expect(repo.reports(actor)).toHaveLength(5);
    });

    it.each(['reset', 'identity'])(
        'cancels delayed relationship/configuration commands after %s',
        async (change) => {
            const repo = TestBed.inject(REPOSITORY),
                actor = TestBed.inject(Session).identity(),
                http = TestBed.inject(HttpClient),
                original = repo.asset('A0001', actor);
            TestBed.inject(Scenario).select('delayed');
            const pending = [
                http.post('/api/teams/T001/transfer', {
                    personId: 'P026',
                    fromTeamId: 'T002',
                    version: 1,
                }),
                http.patch('/api/assets/A0001', {
                    ...original,
                    status: 'maintenance',
                }),
                http.patch('/api/config/settings', {
                    ...repo.settings(actor),
                    organizationName: 'Changed',
                }),
                http.patch('/api/config/roles', {
                    ...repo.roles(actor),
                    managerCanExportReports: false,
                }),
                http.patch('/api/config/categories/equipment', {
                    label: 'Hardware',
                    enabled: false,
                    version: 1,
                }),
                http.post('/api/reports', report),
            ].map((o) => firstValueFrom(o).catch((e) => e));
            if (change === 'reset') TestBed.inject(Scenario).reset();
            else TestBed.inject(Session).select('P025');
            await vi.advanceTimersByTimeAsync(2000);
            for (const p of pending)
                expect(await p).toMatchObject({ status: 409 });
            expect(repo.asset('A0001', actor).status).toBe('available');
            expect(repo.person('P026', actor).person.teamId).toBe('T002');
            expect(repo.settings(actor).organizationName).toBe('Workplace Hub');
            expect(repo.roles(actor).managerCanExportReports).toBe(true);
            expect(repo.categories(actor)[0].enabled).toBe(true);
            expect(repo.reports(actor)).toHaveLength(4);
        },
    );

    it('cancels unsubscribed membership updates and rejects forbidden export', async () => {
        const http = TestBed.inject(HttpClient),
            repo = TestBed.inject(REPOSITORY),
            actor = TestBed.inject(Session).identity();
        const subscription = http
            .post('/api/teams/T001/transfer', {
                personId: 'P026',
                fromTeamId: 'T002',
                version: 1,
            })
            .subscribe();
        subscription.unsubscribe();
        await vi.advanceTimersByTimeAsync(250);
        expect(repo.person('P026', actor).person.teamId).toBe('T002');
        repo.updateRoles(
            { ...repo.roles(actor), managerCanExportReports: false },
            actor,
        );
        TestBed.inject(Session).select('P001');
        const denied = firstValueFrom(
            http.get('/api/reports/REP001/export'),
        ).catch((e) => e);
        await vi.advanceTimersByTimeAsync(250);
        expect(await denied).toMatchObject({ status: 403 });
    });
});
