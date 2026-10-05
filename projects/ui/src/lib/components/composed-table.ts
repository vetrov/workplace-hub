import {
    Component,
    contentChildren,
    Directive,
    inject,
    input,
    TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface CellContext<T> {
    $implicit: T;
    index: number;
}

export interface ColumnSpec<T> {
    readonly key: string;
    readonly heading: string;
    readonly value: (row: T) => unknown;
}

@Directive({ selector: 'ng-template[uiColumn]' })
export class TableColumn<T> {
    readonly uiColumn = input.required<ColumnSpec<T>>();
    readonly template = inject<TemplateRef<CellContext<T>>>(TemplateRef);

    static ngTemplateContextGuard<T>(
        _directive: TableColumn<T>,
        _context: unknown,
    ): _context is CellContext<T> {
        return true;
    }
}

@Component({
    selector: 'ui-composed-table',
    imports: [NgTemplateOutlet],
    template: `
        <ng-content />
        <div class="table-wrap">
            <table>
                <caption class="sr-only">{{ caption() }}</caption>
                <thead>
                    <tr>
                        @for (
                            column of columns();
                            track column.uiColumn().key
                        ) {
                            <th scope="col">{{ column.uiColumn().heading }}</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (row of rows(); track row.id; let index = $index) {
                        <tr>
                            @for (
                                column of columns();
                                track column.uiColumn().key
                            ) {
                                <td>
                                    <ng-container
                                        [ngTemplateOutlet]="column.template"
                                        [ngTemplateOutletContext]="{
                                            $implicit: row,
                                            index: index,
                                        }"
                                    />
                                </td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>
        <ng-content select="[tableFooter]" />
    `,
})
export class ComposedTable<T extends { readonly id: string }> {
    readonly rows = input.required<readonly T[]>();
    readonly caption = input.required<string>();
    readonly columns = contentChildren(TableColumn, { descendants: true });
}
