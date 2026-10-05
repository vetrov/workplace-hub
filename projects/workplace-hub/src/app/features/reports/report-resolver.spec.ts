import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    convertToParamMap,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { MockRepository } from '../../core/mock-http/mock-repository';
import { DemoContext } from '../../core/mock-http/context';
import { DEMO_IDENTITIES } from '../../core/mock-http/seed-data';
import { Session } from '../../core/session/session';
import { demoContextProviders } from '../../testing/demo-providers';
import { reportResolver, ReportResolution } from './report-resolver';

function resolve(): Observable<ReportResolution> {
    return TestBed.runInInjectionContext(() =>
        reportResolver(
            {
                paramMap: convertToParamMap({ id: 'REP001' }),
            } as ActivatedRouteSnapshot,
            {} as RouterStateSnapshot,
        ),
    ) as Observable<ReportResolution>;
}

describe('functional report resolver recovery/cancellation', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ...demoContextProviders(),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        TestBed.inject(Session).select('P001');
    });
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('maps matching authorized response and rejects obsolete envelopes', () => {
        const observer = vi.fn();
        resolve().subscribe(observer);
        const http = TestBed.inject(HttpTestingController),
            context = TestBed.inject(DemoContext);
        const run = new MockRepository().report('REP001', DEMO_IDENTITIES[1]);
        http.expectOne((r) => r.url === '/api/reports/REP001').flush({
            record: run,
            contextKey: context.key(),
        });
        expect(observer).toHaveBeenLastCalledWith({
            kind: 'ready',
            run,
            contextKey: context.key(),
        });
        resolve().subscribe(observer);
        http.expectOne((r) => r.url === '/api/reports/REP001').flush({
            record: run,
            contextKey: 'obsolete',
        });
        expect(observer.mock.lastCall?.[0].kind).toBe('context-changed');
    });

    it('turns503 into route data and unsubscribes superseded navigation reads', () => {
        const observer = vi.fn(),
            http = TestBed.inject(HttpTestingController);
        resolve().subscribe(observer);
        http.expectOne((r) => r.url === '/api/reports/REP001').flush(
            { message: 'Try again.' },
            { status: 503, statusText: 'Unavailable' },
        );
        expect(observer.mock.lastCall?.[0]).toMatchObject({
            kind: 'error',
            message: 'Try again.',
        });
        const subscription = resolve().subscribe(observer),
            pending = http.expectOne((r) => r.url === '/api/reports/REP001');
        subscription.unsubscribe();
        expect(pending.cancelled).toBe(true);
    });

    it('emits recovery data instead of EMPTY when context changes and ignores stale stream emissions', () => {
        const observer = vi.fn(),
            http = TestBed.inject(HttpTestingController);
        TestBed.tick();
        resolve().subscribe(observer);
        const pending = http.expectOne((r) => r.url === '/api/reports/REP001');
        TestBed.inject(Session).select('P013');
        TestBed.tick();
        expect(pending.cancelled).toBe(true);
        expect(observer.mock.lastCall?.[0].kind).toBe('context-changed');
        resolve().subscribe(observer);
        const fresh = http.expectOne((r) => r.url === '/api/reports/REP001');
        expect(fresh.cancelled).toBe(false);
        fresh.flush({
            record: new MockRepository().report('REP001', DEMO_IDENTITIES[2]),
            contextKey: TestBed.inject(DemoContext).key(),
        });
        expect(observer.mock.lastCall?.[0].kind).toBe('ready');
    });
});
