import { InjectionToken } from '@angular/core';

export type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const BROWSER_STORAGE = new InjectionToken<PreferenceStorage | null>('Browser preference storage', {
  providedIn: 'root', factory: () => { try { return globalThis.localStorage ?? null; } catch { return null; } },
});
