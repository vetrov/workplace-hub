import { Injectable, signal } from '@angular/core';
import { DEFAULT_PREFERENCES, DisplayPreferences } from 'domain';

@Injectable({ providedIn: 'root' })
export class Preferences {
  readonly value = signal<DisplayPreferences>({ ...DEFAULT_PREFERENCES });
  readonly feedback = signal('');
  save(_value: DisplayPreferences): void { /* Implemented in T020. */ }
}
