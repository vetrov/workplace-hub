import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ColumnSpec, ComposedTable, TableColumn } from 'ui';

interface Row {
    id: string;
    label: string;
    status: string;
}

@Component({
    imports: [ComposedTable, TableColumn],
    template: `
        <ui-composed-table
            [rows]="rows()"
            caption="Typed report rows"
        >
            <ng-template
                [uiColumn]="name"
                let-row
            >
                <strong>{{ row.label }}</strong>
            </ng-template>
            @if (showStatus()) {
                <ng-template
                    [uiColumn]="status"
                    let-row
                >
                    {{ row.status }}
                </ng-template>
            }
            <p tableFooter>Showing current rows</p>
        </ui-composed-table>
    `,
})
class TableHost {
    readonly rows = signal<Row[]>([
        { id: 'R1', label: 'First report', status: 'submitted' },
    ]);
    readonly showStatus = signal(true);
    readonly name: ColumnSpec<Row> = {
        key: 'label',
        heading: 'Record',
        value: (r) => r.label,
    };
    readonly status: ColumnSpec<Row> = {
        key: 'status',
        heading: 'Status',
        value: (r) => r.status,
    };
}

it('reacts to projected column definitions and typed cell contexts without stale row values', async () => {
    const f = TestBed.createComponent(TableHost);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('th')).toHaveLength(2);
    expect(f.nativeElement.querySelector('tbody').textContent).toContain(
        'First report',
    );
    f.componentInstance.rows.set([
        { id: 'R1', label: 'Updated report', status: 'approved' },
    ]);
    await f.whenStable();
    expect(f.nativeElement.querySelector('tbody').textContent).toContain(
        'Updated report',
    );
    f.componentInstance.showStatus.set(false);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('th')).toHaveLength(1);
    expect(f.nativeElement.querySelectorAll('td')).toHaveLength(1);
    expect(f.nativeElement.textContent).toContain('Showing current rows');
});
