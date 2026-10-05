import {
    ChangeDetectorRef,
    effect,
    inject,
    signal,
    untracked,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Session } from './session/session';
import { Scenario } from './scenarios/scenario';
import { WorkflowClient } from './workflow-client';
import { fieldError } from './form-validation';

export function reactiveEditor<T extends { readonly version: number }>(
    form: AbstractControl,
    record: () => T | undefined,
    scope: () => string,
    values: (record: T) => unknown,
) {
    const session = inject(Session),
        scenario = inject(Scenario),
        mutation = inject(WorkflowClient),
        cdr = inject(ChangeDetectorRef);
    const loaded = signal<T | undefined>(undefined),
        attempted = signal(false),
        feedback = signal('');
    const clear = () => {
        form.reset();
        loaded.set(undefined);
        attempted.set(false);
        feedback.set('');
    };
    const load = (record: T) => {
        form.reset(values(record));
        loaded.set(record);
        attempted.set(false);
    };
    form.events.pipe(takeUntilDestroyed()).subscribe(() => cdr.markForCheck());
    effect(() => {
        scope();
        session.epoch();
        scenario.resetVersion();
        untracked(clear);
    });
    effect(() => {
        const current = record(),
            saved = loaded();
        if (
            current &&
            (!saved || (current.version !== saved.version && !form.dirty))
        )
            untracked(() => load(current));
    });
    effect(() => {
        if (mutation.busy()) form.disable({ emitEvent: false });
        else form.enable({ emitEvent: false });
    });
    return {
        loaded,
        attempted,
        feedback,
        load,
        clear,
        error: (control: AbstractControl, label: string) =>
            control.invalid && (control.touched || attempted())
                ? fieldError(control, label)
                : '',
        valid: () => {
            attempted.set(true);
            form.markAllAsTouched();
            return !mutation.busy() && form.valid;
        },
        canLeave: () =>
            !mutation.busy() &&
            (!form.dirty || window.confirm('Discard unsaved changes?')),
    };
}
