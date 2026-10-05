import {
    afterRenderEffect,
    Component,
    computed,
    effect,
    ElementRef,
    forwardRef,
    input,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
} from '@angular/forms';

export interface EmployeeOption {
    readonly value: string;
    readonly label: string;
}

@Component({
    selector: 'ui-employee-picker',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmployeePicker),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => EmployeePicker),
            multi: true,
        },
    ],
    template: `
        <select
            #select
            [id]="fieldId()"
            [value]="value() ?? ''"
            [disabled]="disabled()"
            [attr.aria-label]="label()"
            [attr.aria-describedby]="describedBy() || null"
            (change)="choose(select.value)"
            (blur)="touch()"
        >
            <option
                value=""
                [selected]="!value()"
            >
                {{ emptyLabel() }}
            </option>
            @if (unavailable()) {
                <option
                    [value]="value()"
                    disabled
                    selected
                >
                    Unavailable selection ({{ value() }})
                </option>
            }
            @for (option of options(); track option.value) {
                <option
                    [value]="option.value"
                    [selected]="value() === option.value"
                >
                    {{ option.label }}
                </option>
            }
        </select>
    `,
})
export class EmployeePicker implements ControlValueAccessor, Validator {
    readonly fieldId = input.required<string>();
    readonly options = input.required<readonly EmployeeOption[]>();
    readonly label = input('Employee');
    readonly emptyLabel = input('Choose a colleague');
    readonly describedBy = input('');
    readonly value = signal<string | null>(null);
    readonly disabled = signal(false);
    readonly unavailable = computed(
        () =>
            !!this.value() &&
            !this.options().some((o) => o.value === this.value()),
    );
    private readonly select =
        viewChild<ElementRef<HTMLSelectElement>>('select');
    private changed: (value: string | null) => void = () => {};
    private touched: () => void = () => {};
    private validatorChanged: () => void = () => {};

    constructor() {
        afterRenderEffect({
            write: () => {
                this.options();
                const value = this.value() ?? '';
                const select = this.select()?.nativeElement;
                if (select) select.value = value;
            },
        });
        effect(() => {
            this.options();
            untracked(() => this.validatorChanged());
        });
    }

    writeValue(value: string | null): void {
        this.value.set(value);
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.changed = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.touched = fn;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.validatorChanged = fn;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled.set(disabled);
    }

    validate(control: AbstractControl): ValidationErrors | null {
        return !control.value ||
            this.options().some((o) => o.value === control.value)
            ? null
            : { unknownOption: true };
    }

    choose(value: string): void {
        if (
            this.disabled() ||
            (value && !this.options().some((o) => o.value === value))
        )
            return;
        this.value.set(value || null);
        this.changed(value || null);
    }

    touch(): void {
        this.touched();
    }

    focus(): void {
        this.select()?.nativeElement.focus();
    }
}
