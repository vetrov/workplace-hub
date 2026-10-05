import { trimmedText } from '../../core/form-validation';
import {
    FormArray,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import {
    RequestCategory,
    RequestLine,
    validCalendarDate,
    WORKFLOW_LIMITS,
} from 'domain';

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
                (c) =>
                    ['equipment', 'software'].includes(c.value)
                        ? null
                        : { category: true },
            ],
        }),
        delivery: new FormGroup({
            location: new FormControl('', {
                nonNullable: true,
                validators: [trimmedText(3, WORKFLOW_LIMITS.location)],
            }),
            neededBy: new FormControl('', {
                nonNullable: true,
                validators: [
                    (c) => (validCalendarDate(c.value) ? null : { date: true }),
                ],
            }),
        }),
        items: new FormArray([createRequestLine()], {
            validators: [
                (c) =>
                    c.value.length >= 1 &&
                    c.value.length <= WORKFLOW_LIMITS.items
                        ? null
                        : { count: true },
            ],
        }),
    });
}

export { trimmedText, fieldError } from '../../core/form-validation';
