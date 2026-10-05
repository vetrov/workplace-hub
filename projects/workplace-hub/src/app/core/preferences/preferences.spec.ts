import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../storage';
import { Preferences } from './preferences';

describe('display preferences', () => {
    let values: Map<string, string>;
    beforeEach(() => {
        values = new Map();
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: BROWSER_STORAGE,
                    useValue: {
                        getItem: (key: string) => values.get(key) ?? null,
                        setItem: (key: string, value: string) =>
                            values.set(key, value),
                    },
                },
            ],
        });
    });
    it('restores valid preferences and rejects corrupt or invalid enum data', () => {
        values.set(
            'workplace-hub.preferences.v1',
            JSON.stringify({ appearance: 'dark', density: 'compact' }),
        );
        expect(TestBed.inject(Preferences).value()).toEqual({
            appearance: 'dark',
            density: 'compact',
        });
    });
    it.each([
        '{broken',
        '{"appearance":"neon","density":"compact"}',
        'null',
        '[]',
    ])('falls back safely for %s', (value) => {
        values.set('workplace-hub.preferences.v1', value);
        expect(TestBed.inject(Preferences).value()).toEqual({
            appearance: 'light',
            density: 'comfortable',
        });
    });
    it('saves a copy of the preferences and applies them to the document', () => {
        const preferences = TestBed.inject(Preferences);
        const draft = {
            appearance: 'dark' as const,
            density: 'compact' as const,
        };
        preferences.save(draft);
        expect(JSON.parse(values.get('workplace-hub.preferences.v1')!)).toEqual(
            draft,
        );
        expect(preferences.value()).not.toBe(draft);
        expect(document.documentElement.dataset['appearance']).toBe('dark');
        expect(document.documentElement.dataset['density']).toBe('compact');
    });
    it('keeps preferences usable when reads and writes are blocked', () => {
        TestBed.overrideProvider(BROWSER_STORAGE, {
            useValue: {
                getItem: () => {
                    throw Error('blocked');
                },
                setItem: () => {
                    throw Error('blocked');
                },
            },
        });
        const preferences = TestBed.inject(Preferences);
        preferences.save({ appearance: 'dark', density: 'compact' });
        expect(preferences.value().appearance).toBe('dark');
        expect(preferences.feedback()).toContain('current session');
    });
});
