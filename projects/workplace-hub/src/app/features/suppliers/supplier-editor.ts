import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupplierDetail, SupplierInput } from 'domain';
import { SupplierField } from './supplier-field';

const trimmed =
    (minimum: number, maximum: number): ValidatorFn =>
    (control) =>
        typeof control.value === 'string' &&
        control.value.trim().length >= minimum &&
        control.value.trim().length <= maximum
            ? null
            : { textLength: true };
const contactEmail: ValidatorFn = (control) =>
    typeof control.value === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value.trim())
        ? null
        : { email: true };

@Component({
    selector: 'app-supplier-editor',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <form
            class="panel workflow-form"
            [formGroup]="form"
            (ngSubmit)="save()"
            novalidate
        >
            <p
                class="form-alert"
                role="alert"
                *ngIf="attempted && form.invalid"
            >
                Check the supplier contact fields below.
            </p>
            <app-supplier-field
                #firstField
                controlId="supplier-name"
                label="Supplier name"
                [error]="error('name', 'Supplier name')"
            >
                <input
                    supplierControl
                    id="supplier-name"
                    formControlName="name"
                    maxlength="100"
                    [attr.aria-invalid]="
                        form.controls.name.invalid && form.controls.name.touched
                    "
                    [attr.aria-describedby]="
                        error('name', 'Supplier name')
                            ? 'supplier-name-error'
                            : null
                    "
                />
            </app-supplier-field>
            <app-supplier-field
                controlId="supplier-contact"
                label="Contact name"
                [error]="error('contactName', 'Contact name')"
            >
                <input
                    supplierControl
                    id="supplier-contact"
                    formControlName="contactName"
                    maxlength="100"
                    [attr.aria-invalid]="
                        form.controls.contactName.invalid &&
                        form.controls.contactName.touched
                    "
                    [attr.aria-describedby]="
                        error('contactName', 'Contact name')
                            ? 'supplier-contact-error'
                            : null
                    "
                />
            </app-supplier-field>
            <app-supplier-field
                controlId="supplier-email"
                label="Contact email"
                [error]="error('email', 'Contact email')"
            >
                <input
                    supplierControl
                    id="supplier-email"
                    type="email"
                    formControlName="email"
                    maxlength="160"
                    [attr.aria-invalid]="
                        form.controls.email.invalid &&
                        form.controls.email.touched
                    "
                    [attr.aria-describedby]="
                        error('email', 'Contact email')
                            ? 'supplier-email-error'
                            : null
                    "
                />
            </app-supplier-field>
            <app-supplier-field
                controlId="supplier-phone"
                label="Phone (optional)"
                [error]="error('phone', 'Phone')"
            >
                <input
                    supplierControl
                    id="supplier-phone"
                    type="tel"
                    formControlName="phone"
                    maxlength="40"
                />
            </app-supplier-field>
            <app-supplier-field
                controlId="supplier-notes"
                label="Notes (optional)"
                [error]="error('notes', 'Notes')"
            >
                <textarea
                    supplierControl
                    id="supplier-notes"
                    formControlName="notes"
                    rows="3"
                    maxlength="1000"
                ></textarea>
            </app-supplier-field>
            <div class="form-actions">
                <p>Changes are local to this demo session.</p>
                <button
                    type="submit"
                    class="primary"
                    [disabled]="busy"
                >
                    {{ busy ? 'Saving supplier…' : 'Save supplier' }}
                </button>
            </div>
        </form>
    `,
})
export class SupplierEditor implements OnChanges, AfterViewInit {
    @Input({ required: true, alias: 'record' })
    supplier: SupplierDetail | null = null;
    @Input({ transform: booleanAttribute }) busy = false;
    @Output() saved = new EventEmitter<SupplierInput>();
    @ViewChild('firstField') firstField!: SupplierField;
    @ViewChildren(SupplierField) fields!: QueryList<SupplierField>;
    attempted = false;
    readonly form = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [trimmed(3, 100)],
        }),
        contactName: new FormControl('', {
            nonNullable: true,
            validators: [trimmed(3, 100)],
        }),
        email: new FormControl('', {
            nonNullable: true,
            validators: [trimmed(3, 160), contactEmail],
        }),
        phone: new FormControl('', {
            nonNullable: true,
            validators: [trimmed(0, 40)],
        }),
        notes: new FormControl('', {
            nonNullable: true,
            validators: [trimmed(0, 1000)],
        }),
    });

    constructor(cdr: ChangeDetectorRef, destroy: DestroyRef) {
        this.form.events
            .pipe(takeUntilDestroyed(destroy))
            .subscribe(() => cdr.markForCheck());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['supplier']) {
            const s = this.supplier;
            this.form.reset({
                name: s?.name ?? '',
                contactName: s?.contactName ?? '',
                email: s?.email ?? '',
                phone: s?.phone ?? '',
                notes: s?.notes ?? '',
            });
            this.attempted = false;
        }
        if (this.busy) this.form.disable({ emitEvent: false });
        else this.form.enable({ emitEvent: false });
    }

    ngAfterViewInit(): void {
        this.firstField.focusFirst();
    }

    error(
        name: keyof SupplierEditor['form']['controls'],
        label: string,
    ): string {
        const control = this.form.controls[name];
        if (!control.invalid || !control.touched) return '';
        return name === 'email'
            ? 'Enter a valid contact email (at most 160 characters).'
            : `${label} ${name === 'name' || name === 'contactName' ? 'must contain 3–100 characters.' : 'is too long.'}`;
    }

    resetDraft(): void {
        this.form.reset();
        this.attempted = false;
    }

    markSaved(): void {
        this.form.markAsPristine();
    }

    save(): void {
        if (this.busy) return;
        this.attempted = true;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            this.fields.find((field) => field.focusInvalid());
            return;
        }
        this.saved.emit(this.form.getRawValue());
    }
}
