import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RecordResult, RequestDetail } from 'domain';
import { DEMO_SESSION, REPOSITORY, MockRepository, SCENARIO_CONTEXT } from './mock-repository';
import { mockInterceptor } from './mock.interceptor';
import { Scenario } from '../scenarios/scenario';
import { Session } from '../session/session';
import { BROWSER_STORAGE } from '../storage';

const input = () => ({
  title: 'New laptop',
  justification: 'A replacement laptop for development.',
  category: 'equipment',
  status: 'submitted',
  delivery: { location: 'Helsinki', neededBy: '2026-12-01' },
  items: [{ description: 'Laptop', quantity: 1, unitCost: 1000 }],
});
describe('HTTP workflow commit timing', () => {
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
            const s = inject(Session);
            return () => ({ identity: s.identity(), epoch: s.epoch() });
          },
        },
        {
          provide: SCENARIO_CONTEXT,
          useFactory: () => {
            const s = inject(Scenario);
            return () => ({ mode: s.mode(), generation: s.generation() });
          },
        },
      ],
    });
  });
  afterEach(() => vi.useRealTimers());
  it('commits a valid immutable command snapshot only when its delay completes', async () => {
    const body = input(),
      repo = TestBed.inject(REPOSITORY);
    const result = firstValueFrom(
      TestBed.inject(HttpClient).post<RecordResult<RequestDetail>>('/api/requests', body),
    );
    body.title = 'Changed after dispatch';
    expect(repo.data.requests).toHaveLength(250);
    await vi.advanceTimersByTimeAsync(250);
    expect((await result).record).toMatchObject({
      id: 'R0251',
      title: 'New laptop',
      status: 'submitted',
    });
    expect(repo.data.requests).toHaveLength(251);
  });
  it.each([
    ['error', 503],
    ['empty', 409],
  ] as const)('does not write in %s response mode', async (mode, status) => {
    TestBed.inject(Scenario).select(mode);
    const result = firstValueFrom(TestBed.inject(HttpClient).post('/api/requests', input())).catch(
      (e) => e,
    );
    await vi.advanceTimersByTimeAsync(250);
    expect(await result).toMatchObject({ status });
    expect(TestBed.inject(REPOSITORY).data.requests).toHaveLength(250);
  });
  it.each(['reset', 'identity'])('rejects a pending command after %s changes', async (change) => {
    TestBed.inject(Scenario).select('delayed');
    const result = firstValueFrom(TestBed.inject(HttpClient).post('/api/requests', input())).catch(
      (e) => e,
    );
    if (change === 'reset') TestBed.inject(Scenario).reset();
    else TestBed.inject(Session).select('P013');
    await vi.advanceTimersByTimeAsync(2000);
    expect(await result).toMatchObject({ status: 409 });
    expect(TestBed.inject(REPOSITORY).data.requests).toHaveLength(250);
  });
  it('does not commit unsubscribed commands', async () => {
    const received = vi.fn();
    const subscription = TestBed.inject(HttpClient)
      .post('/api/requests', input())
      .subscribe(received);
    subscription.unsubscribe();
    await vi.advanceTimersByTimeAsync(250);
    expect(received).not.toHaveBeenCalled();
    expect(TestBed.inject(REPOSITORY).data.requests).toHaveLength(250);
  });
});
