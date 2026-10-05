import { Signal, WritableSignal } from '@angular/core';
import {
    disabled,
    form,
    max,
    min,
    maxLength,
    minLength,
    required,
    validate,
} from '@angular/forms/signals';

export interface PolicyDraft {
    name: string;
    category: string;
    maximumTotal: number | null;
    enabled: boolean;
    notes: string;
}

export const emptyPolicyDraft = (): PolicyDraft => ({
    name: '',
    category: '',
    maximumTotal: null,
    enabled: true,
    notes: '',
});

export function createPolicyForm(
    model: WritableSignal<PolicyDraft>,
    busy: Signal<boolean>,
) {
    return form(model, (path) => {
        required(path.name, { message: 'Policy name is required.' });
        minLength(path.name, 3, {
            message: 'Policy name needs at least 3 characters.',
        });
        maxLength(path.name, 100, {
            message: 'Policy name cannot exceed 100 characters.',
        });
        validate(path.name, ({ value }) =>
            value().trim().length >= 3
                ? undefined
                : {
                      kind: 'trimmed',
                      message:
                          'Policy name must contain at least 3 non-padding characters.',
                  },
        );
        required(path.category, { message: 'Choose a request category.' });
        validate(path.category, ({ value }) =>
            ['equipment', 'software', 'service'].includes(value())
                ? undefined
                : {
                      kind: 'category',
                      message: 'Choose a supported request category.',
                  },
        );
        required(path.maximumTotal, { message: 'Maximum total is required.' });
        min(path.maximumTotal, 0.01, {
            message: 'Maximum total must be at least 0.01.',
        });
        max(path.maximumTotal, 10000000, {
            message: 'Maximum total cannot exceed 10,000,000.',
        });
        validate(path.maximumTotal, ({ value }) => {
            const total = value();
            return typeof total === 'number' &&
                Number.isFinite(total) &&
                total >= 0.01 &&
                total <= 10000000 &&
                Math.abs(total * 100 - Math.round(total * 100)) < 1e-6
                ? undefined
                : {
                      kind: 'money',
                      message:
                          'Maximum total must be 0.01–10,000,000 with at most two decimals.',
                  };
        });
        maxLength(path.notes, 1000, {
            message: 'Notes cannot exceed 1000 characters.',
        });
        disabled(path, { when: () => busy() });
    });
}
