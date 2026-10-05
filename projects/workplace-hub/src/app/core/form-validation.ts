import { AbstractControl, ValidatorFn } from '@angular/forms';

export const trimmedText =
    (min: number, max: number): ValidatorFn =>
    (control) =>
        typeof control.value === 'string' &&
        control.value.trim().length >= min &&
        control.value.trim().length <= max
            ? null
            : { text: { min, max } };

export function fieldError(control: AbstractControl, label: string): string {
    const error = control.errors;
    if (!error) return '';
    if (error['text'])
        return `${label} needs ${error['text'].min}–${error['text'].max} characters.`;
    if (error['money'])
        return 'Enter a number with at most two decimal places.';
    if (error['required']) return `${label} is required.`;
    if (error['integer']) return `${label} must be a whole number.`;
    if (error['date']) return 'Choose a valid calendar date.';
    if (error['decimals'] || error['money'])
        return 'Enter a number with at most two decimal places.';
    if (error['min']) return `${label} must be at least ${error['min'].min}.`;
    if (error['max']) return `${label} must be at most ${error['max'].max}.`;
    if (error['count']) return 'Add between 1 and 10 items.';
    return `Choose a valid ${label.toLowerCase()}.`;
}
