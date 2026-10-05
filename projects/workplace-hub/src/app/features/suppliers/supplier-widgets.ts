import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    NgModule,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierDetail } from 'domain';
import { ReactiveFormsModule } from '@angular/forms';
import { SupplierEditor } from './supplier-editor';
import { SupplierField, SupplierControl } from './supplier-field';

@Component({
    selector: 'app-supplier-card',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Default,
    template: `
        <article class="supplier-card">
            <h3>{{ displayName }}</h3>
            <p>{{ supplier.contactName }} · {{ supplier.email }}</p>
            <button
                type="button"
                *ngIf="!readonlyMode"
                (click)="editRequested.emit(supplier.id)"
            >
                Edit contact
            </button>
        </article>
    `,
})
export class SupplierCard implements OnChanges {
    @Input({ required: true, alias: 'record' }) supplier!: SupplierDetail;
    @Input({ alias: 'readOnly', transform: booleanAttribute }) readonlyMode =
        false;
    @Output() editRequested = new EventEmitter<string>();
    displayName = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['supplier']) this.displayName = this.supplier.name;
    }
}

@NgModule({
    declarations: [
        SupplierCard,
        SupplierEditor,
        SupplierField,
        SupplierControl,
    ],
    imports: [CommonModule, ReactiveFormsModule],
    exports: [SupplierCard, SupplierEditor],
})
export class SupplierWidgetsModule {}
