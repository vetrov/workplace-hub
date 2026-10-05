import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RequestCategory, RequestLine, validCalendarDate, WORKFLOW_LIMITS } from 'domain';

export const trimmedText =
  (min: number, max: number): ValidatorFn =>
  (control) =>
    typeof control.value === 'string' &&
    control.value.trim().length >= min &&
    control.value.trim().length <= max
      ? null
      : { text: { min, max } };
const integer: ValidatorFn = (control) =>
  Number.isInteger(control.value) ? null : { integer: true };
const decimals: ValidatorFn = (control) =>
  typeof control.value === 'number' &&
  Number.isFinite(control.value) &&
  Math.abs(control.value * 100 - Math.round(control.value * 100)) < 1e-6
    ? null
    : { decimals: true };
export function createRequestLine(value?: RequestLine) {
  return new FormGroup({
    description: new FormControl(value?.description ?? '', {
      nonNullable: true,
      validators: [trimmedText(3, WORKFLOW_LIMITS.itemDescription)],
    }),
    quantity: new FormControl(value?.quantity ?? 1, {
      nonNullable: true,
      validators: [
        Validators.required,
        integer,
        Validators.min(1),
        Validators.max(WORKFLOW_LIMITS.quantity),
      ],
    }),
    unitCost: new FormControl(value?.unitCost ?? 0, {
      nonNullable: true,
      validators: [
        Validators.required,
        decimals,
        Validators.min(0.01),
        Validators.max(WORKFLOW_LIMITS.unitCost),
      ],
    }),
  });
}
export function createRequestForm() {
  return new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [trimmedText(3, WORKFLOW_LIMITS.title)],
    }),
    justification: new FormControl('', {
      nonNullable: true,
      validators: [trimmedText(10, WORKFLOW_LIMITS.justification)],
    }),
    category: new FormControl<RequestCategory>('equipment', {
      nonNullable: true,
      validators: [
        (c) => (['equipment', 'software'].includes(c.value) ? null : { category: true }),
      ],
    }),
    delivery: new FormGroup({
      location: new FormControl('', {
        nonNullable: true,
        validators: [trimmedText(3, WORKFLOW_LIMITS.location)],
      }),
      neededBy: new FormControl('', {
        nonNullable: true,
        validators: [(c) => (validCalendarDate(c.value) ? null : { date: true })],
      }),
    }),
    items: new FormArray([createRequestLine()], {
      validators: [
        (c) =>
          c.value.length >= 1 && c.value.length <= WORKFLOW_LIMITS.items ? null : { count: true },
      ],
    }),
  });
}
export function fieldError(control: AbstractControl, label: string): string {
  const error = control.errors;
  if (!error) return '';
  if (error['text']) return `${label} needs ${error['text'].min}–${error['text'].max} characters.`;
  if (error['money']) return 'Enter a number with at most two decimal places.';
  if (error['required']) return `${label} is required.`;
  if (error['integer']) return `${label} must be a whole number.`;
  if (error['date']) return 'Choose a valid calendar date.';
  if (error['decimals'] || error['money']) return 'Enter a number with at most two decimal places.';
  if (error['min']) return `${label} must be at least ${error['min'].min}.`;
  if (error['max']) return `${label} must be at most ${error['max'].max}.`;
  if (error['count']) return 'Add between 1 and 10 items.';
  return `Choose a valid ${label.toLowerCase()}.`;
}
