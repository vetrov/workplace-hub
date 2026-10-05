import {
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    Input,
    Optional,
    QueryList,
    Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ selector: '[supplierControl]', standalone: false })
export class SupplierControl {
    constructor(
        readonly element: ElementRef<HTMLElement>,
        @Optional() @Self() readonly control: NgControl | null,
    ) {}

    focus(): void {
        this.element.nativeElement.focus();
    }
}

@Component({
    selector: 'app-supplier-field',
    standalone: false,
    template: `
        <div class="field">
            <label [attr.for]="controlId">{{ label }}</label>
            <ng-content />
            <small
                class="field-error"
                *ngIf="error"
                [id]="controlId + '-error'"
            >
                {{ error }}
            </small>
        </div>
    `,
})
export class SupplierField {
    @Input({ required: true }) controlId = '';
    @Input({ required: true }) label = '';
    @Input() error = '';
    @ContentChildren(SupplierControl, { descendants: true })
    controls!: QueryList<SupplierControl>;

    focusInvalid(): boolean {
        const control = this.controls.find((c) => !!c.control?.invalid);
        control?.focus();
        return !!control;
    }

    focusFirst(): void {
        this.controls.first?.focus();
    }
}
