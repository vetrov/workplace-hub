import {
    Component,
    ElementRef,
    input,
    model,
    output,
    viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

export interface CategoryOption {
    readonly value: string;
    readonly label: string;
}

@Component({
    selector: 'ui-category-picker',
    template: `
        <select
            #select
            [id]="fieldId()"
            [attr.aria-label]="label()"
            [value]="value()"
            [disabled]="disabled()"
            [required]="required()"
            [attr.aria-invalid]="invalid() && touched()"
            [attr.aria-describedby]="describedBy() || null"
            (change)="choose($event)"
            (blur)="touch.emit()"
        >
            <option value="">Choose category</option>
            @for (option of options(); track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
            }
        </select>
    `,
})
export class CategoryPicker implements FormValueControl<string> {
    readonly value = model('');
    readonly fieldId = input.required<string>();
    readonly label = input('Category');
    readonly options = input.required<readonly CategoryOption[]>();
    readonly describedBy = input('');
    readonly disabled = input(false);
    readonly required = input(false);
    readonly invalid = input(false);
    readonly touched = input(false);
    readonly touch = output<void>();
    private readonly select =
        viewChild<ElementRef<HTMLSelectElement>>('select');

    choose(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        if (!value || this.options().some((option) => option.value === value))
            this.value.set(value);
    }

    focus(options?: FocusOptions): void {
        this.select()?.nativeElement.focus(options);
    }
}
