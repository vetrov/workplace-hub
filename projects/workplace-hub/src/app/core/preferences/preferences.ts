import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DEFAULT_PREFERENCES, DisplayPreferences } from 'domain';
import { BROWSER_STORAGE } from '../storage';

@Injectable({ providedIn: 'root' })
export class Preferences {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly document = inject(DOCUMENT);
  private readonly selected = signal<Readonly<DisplayPreferences>>(DEFAULT_PREFERENCES);
  readonly value = this.selected.asReadonly();
  readonly feedback = signal('');

  constructor() {
    try {
      const saved: unknown = JSON.parse(
        this.storage?.getItem('workplace-hub.preferences.v1') ?? 'null',
      );
      if (this.isValid(saved))
        this.selected.set(Object.freeze({ appearance: saved.appearance, density: saved.density }));
    } catch {
      /* Safe defaults remain available when storage is blocked or corrupt. */
    }
    this.apply();
  }

  save(value: DisplayPreferences): void {
    if (!this.isValid(value)) {
      this.feedback.set('Choose a valid appearance and density.');
      return;
    }
    this.selected.set(Object.freeze({ ...value }));
    this.apply();
    try {
      if (!this.storage) throw Error('Storage unavailable');
      this.storage.setItem('workplace-hub.preferences.v1', JSON.stringify(this.value()));
      this.feedback.set('Preferences saved for this browser.');
    } catch {
      this.feedback.set(
        'Saved for the current session. This browser could not store your preferences.',
      );
    }
  }

  private apply(): void {
    this.document.documentElement.dataset['appearance'] = this.value().appearance;
    this.document.documentElement.dataset['density'] = this.value().density;
  }
  private isValid(value: unknown): value is DisplayPreferences {
    return (
      !!value &&
      typeof value === 'object' &&
      'appearance' in value &&
      'density' in value &&
      (value.appearance === 'light' || value.appearance === 'dark') &&
      (value.density === 'comfortable' || value.density === 'compact')
    );
  }
}
