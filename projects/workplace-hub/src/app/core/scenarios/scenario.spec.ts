import { TestBed } from '@angular/core/testing';
import { MockRepository, REPOSITORY } from '../mock-http/mock-repository';
import { BROWSER_STORAGE } from '../storage';
import { Session } from '../session/session';
import { Scenario } from './scenario';

describe('scenario reset', () => {
  let repo: MockRepository;
  beforeEach(() => {
    repo = new MockRepository();
    TestBed.configureTestingModule({
      providers: [
        { provide: REPOSITORY, useValue: repo },
        { provide: BROWSER_STORAGE, useValue: null },
      ],
    });
  });
  it('restores immutable seeds, response mode, and generations while preserving identity', () => {
    const scenario = TestBed.inject(Scenario),
      session = TestBed.inject(Session);
    session.select('P013');
    scenario.select('error');
    const initial = repo.data;
    repo.data = { ...repo.data, requests: [] };
    const old = scenario.generation();
    scenario.reset();
    expect(repo.data).toEqual(initial);
    expect(scenario.mode()).toBe('normal');
    expect(scenario.generation()).toBeGreaterThan(old);
    expect(scenario.resetVersion()).toBe(1);
    expect(session.identity().personId).toBe('P013');
  });
  it('retry restores normal responses without replacing the business repository', () => {
    const scenario = TestBed.inject(Scenario);
    scenario.select('error');
    const data = repo.data,
      old = scenario.generation();
    scenario.retry();
    expect(scenario.mode()).toBe('normal');
    expect(scenario.generation()).toBeGreaterThan(old);
    expect(repo.data).toBe(data);
    expect(scenario.resetVersion()).toBe(0);
  });
});
