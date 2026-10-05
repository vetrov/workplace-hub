import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PageResult, RequestSummary } from 'domain';
import { Scenario } from '../scenarios/scenario';
import { Session } from '../session/session';
import { BROWSER_STORAGE } from '../storage';
import { DEMO_SESSION, REPOSITORY, MockRepository, SCENARIO_CONTEXT } from './mock-repository';
import { mockInterceptor } from './mock.interceptor';

describe('synthetic HTTP scenarios', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([mockInterceptor])),
      { provide: BROWSER_STORAGE, useValue: null }, { provide: REPOSITORY, useValue: new MockRepository() },
      { provide: DEMO_SESSION, useFactory: () => { const session = inject(Session); return () => ({ identity: session.identity(), epoch: session.epoch() }); } },
      { provide: SCENARIO_CONTEXT, useFactory: () => { const scenario = inject(Scenario); return () => ({ mode: scenario.mode(), generation: scenario.generation() }); } },
    ] });
  });
  afterEach(() => vi.useRealTimers());
  it('delays responses for two seconds', async () => {
    TestBed.inject(Scenario).select('delayed');
    const received = vi.fn(); TestBed.inject(HttpClient).get('/api/requests').subscribe(received);
    await vi.advanceTimersByTimeAsync(251); expect(received).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1749); expect(received).toHaveBeenCalledOnce();
  });
  it('returns empty lists and recoverable 503 failures', async () => {
    const scenario = TestBed.inject(Scenario), http = TestBed.inject(HttpClient);
    scenario.select('empty');
    const empty = firstValueFrom(http.get<PageResult<RequestSummary>>('/api/requests'));
    await vi.advanceTimersByTimeAsync(250); expect((await empty).total).toBe(0);
    scenario.select('error');
    const failed = firstValueFrom(http.get('/api/requests')).catch(error => error as HttpErrorResponse);
    await vi.advanceTimersByTimeAsync(250); expect((await failed).status).toBe(503);
    scenario.retry();
    const recovered = firstValueFrom(http.get<PageResult<RequestSummary>>('/api/requests'));
    await vi.advanceTimersByTimeAsync(250); expect((await recovered).total).toBeGreaterThan(0);
  });
  it('suppresses obsolete responses after identity changes and reset', async () => {
    const http = TestBed.inject(HttpClient), received = vi.fn();
    http.get('/api/requests').subscribe(received); TestBed.inject(Session).select('P013');
    await vi.advanceTimersByTimeAsync(250); expect(received).not.toHaveBeenCalled();
    http.get('/api/requests').subscribe(received); TestBed.inject(Scenario).reset();
    await vi.advanceTimersByTimeAsync(250); expect(received).not.toHaveBeenCalled();
  });
  it('rejects unsupported endpoints/mutations and cancels unsubscribed responses', async () => {
    const http = TestBed.inject(HttpClient);
    const unknown = firstValueFrom(http.get('/api/unknown')).catch(e => e as HttpErrorResponse);
    const mutation = firstValueFrom(http.post('/api/requests', {})).catch(e => e as HttpErrorResponse);
    const received = vi.fn(); const subscription = http.get('/api/assets').subscribe(received); subscription.unsubscribe();
    await vi.advanceTimersByTimeAsync(250);
    expect((await unknown).status).toBe(404); expect((await mutation).status).toBe(405); expect(received).not.toHaveBeenCalled();
  });
});
