import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../storage';
import { Session } from './session';

describe('demo session', () => {
  let saved: Map<string, string>;
  beforeEach(() => {
    saved = new Map();
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: {
      getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value),
    } }] });
  });
  it('switches identity, persists it, and invalidates previous responses', () => {
    const session = TestBed.inject(Session);
    session.select('P001');
    expect(session.identity().role).toBe('manager');
    expect(session.epoch()).toBe(1);
    expect(saved.get('workplace-hub.identity.v1')).toBe('P001');
    session.select('P013'); session.select('P025');
    expect(session.epoch()).toBe(3);
  });
  it('loads a valid saved identity and rejects invalid changes', () => {
    saved.set('workplace-hub.identity.v1', 'P013');
    const session = TestBed.inject(Session);
    expect(session.identity().role).toBe('administrator');
    session.select('unknown'); expect(session.identity().personId).toBe('P013');
    expect(session.epoch()).toBe(0);
  });
  it('falls back to employee when storage cannot be read', () => {
    TestBed.overrideProvider(BROWSER_STORAGE, { useValue: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } } });
    expect(TestBed.inject(Session).identity().role).toBe('employee');
  });
});
