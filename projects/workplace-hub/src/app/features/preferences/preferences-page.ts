import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DisplayPreferences } from 'domain';
import { Preferences } from '../../core/preferences/preferences';

@Component({ imports: [FormsModule], templateUrl: './preferences-page.html' })
export class PreferencesPage {
    private readonly preferences = inject(Preferences);
    draft: DisplayPreferences = { ...this.preferences.value() };
    readonly notice = signal('');

    save(form: NgForm): void {
        if (form.invalid) return;
        this.preferences.save(this.draft);
        this.notice.set(this.preferences.feedback());
        form.form.markAsPristine();
    }
}
