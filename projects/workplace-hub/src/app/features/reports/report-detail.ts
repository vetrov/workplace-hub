import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportRow, ReportRun, reportRole } from 'domain';
import { ColumnSpec, ComposedTable, StatusBadge, TableColumn } from 'ui';
import { DemoContext } from '../../core/mock-http/context';
import { recordResource } from '../../core/workflow-read';
import { WorkflowClient } from '../../core/workflow-client';
import { Organization } from '../../core/organization';
import { ReportResolution } from './report-resolver';

@Component({
    imports: [RouterLink, ComposedTable, TableColumn, StatusBadge],
    providers: [WorkflowClient],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Saved reporting</p>
                <h1>{{ run()?.report?.name ?? 'Report results' }}</h1>
                <p>
                    Results are recomputed from the records visible to your
                    current identity.
                </p>
            </div>
            <a
                class="button"
                routerLink="/reports"
            >
                Back to reports
            </a>
        </div>
        @if (!allowed()) {
            <section class="panel state">
                <h2>Manager or administrator required</h2>
            </section>
        } @else if (reader.loading()) {
            <p role="status">Loading current report results…</p>
        } @else if (error()) {
            <section
                class="panel state"
                role="alert"
            >
                <h2>Report unavailable</h2>
                <p>{{ error() }}</p>
                <button (click)="retry()">Retry report</button>
                <a
                    class="button"
                    routerLink="/reports"
                >
                    View saved reports
                </a>
            </section>
        } @else if (run(); as result) {
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>{{ result.total }} matching records</h2>
                        <p>
                            {{ result.report.dataset }} ·
                            {{ result.report.status || 'All statuses' }} ·
                            {{ result.report.personId || 'All visible people' }}
                        </p>
                    </div>
                    <div class="detail-actions">
                        <button
                            (click)="retry()"
                            [disabled]="mutation.busy()"
                        >
                            Refresh results
                        </button>
                        <button
                            [disabled]="mutation.busy() || !canExport()"
                            (click)="exportCsv()"
                        >
                            {{ mutation.busy() ? 'Exporting…' : 'Export CSV' }}
                        </button>
                    </div>
                </div>
                @if (mutation.error()) {
                    <p
                        class="form-alert"
                        role="alert"
                    >
                        {{ mutation.error() }}
                    </p>
                }
                @if (!canExport() && organization.record()) {
                    <p class="workflow-form">
                        Manager CSV export is disabled by organization settings.
                    </p>
                }
                @if (result.rows.length) {
                    <ui-composed-table
                        [rows]="result.rows"
                        caption="Report results"
                    >
                        <ng-template
                            [uiColumn]="nameColumn"
                            let-row
                        >
                            <a
                                [routerLink]="[
                                    '/' + result.report.dataset,
                                    row.id,
                                ]"
                            >
                                {{ row.label }}
                            </a>
                            <small>{{ row.id }}</small>
                        </ng-template>
                        <ng-template
                            [uiColumn]="statusColumn"
                            let-row
                        >
                            <ui-status [value]="row.status" />
                        </ng-template>
                        <ng-template
                            [uiColumn]="personColumn"
                            let-row
                        >
                            @if (row.personId) {
                                <a [routerLink]="['/people', row.personId]">
                                    {{ row.personId }}
                                </a>
                            } @else {
                                Unassigned
                            }
                        </ng-template>
                        <p
                            tableFooter
                            class="workflow-form"
                        >
                            Showing {{ result.rows.length }} of
                            {{ result.total }} matching records. CSV includes
                            all authorized matches.
                        </p>
                    </ui-composed-table>
                } @else {
                    <div class="state">
                        <h2>No matching records</h2>
                        <p>
                            Saved filters may have no results for the current
                            identity.
                        </p>
                    </div>
                }
            </section>
        }
    `,
})
export class ReportDetail {
    readonly id = input.required<string>();
    readonly resolved = input.required<ReportResolution>();
    private readonly context = inject(DemoContext);
    readonly organization = inject(Organization);
    readonly mutation = inject(WorkflowClient);
    readonly allowed = computed(() => reportRole(this.context.identity().role));
    private readonly requested = signal(false);
    readonly reader = recordResource<ReportRun>(() =>
        this.allowed() &&
        (this.requested() || this.resolved().contextKey !== this.context.key())
            ? `/api/reports/${encodeURIComponent(this.id())}`
            : undefined,
    );
    readonly run = computed(() => {
        if (!this.allowed()) return undefined;
        const resolved = this.resolved();
        return !this.requested() &&
            resolved.kind === 'ready' &&
            resolved.contextKey === this.context.key() &&
            resolved.run.report.id === this.id()
            ? resolved.run
            : this.reader.record()?.report.id === this.id()
              ? this.reader.record()
              : undefined;
    });
    readonly error = computed(
        () =>
            this.reader.error() ||
            (!this.run() &&
            !this.reader.loading() &&
            this.resolved().kind !== 'ready'
                ? (
                      this.resolved() as Exclude<
                          ReportResolution,
                          { kind: 'ready' }
                      >
                  ).message
                : ''),
    );
    readonly canExport = computed(
        () =>
            this.allowed() &&
            (this.context.identity().role === 'administrator' ||
                !!this.organization.record()?.managerCanExportReports),
    );
    readonly nameColumn: ColumnSpec<ReportRow> = {
        key: 'name',
        heading: 'Record',
        value: (r) => r.label,
    };
    readonly statusColumn: ColumnSpec<ReportRow> = {
        key: 'status',
        heading: 'Status',
        value: (r) => r.status,
    };
    readonly personColumn: ColumnSpec<ReportRow> = {
        key: 'person',
        heading: 'Person',
        value: (r) => r.personId,
    };

    retry(): void {
        this.requested.set(true);
        this.reader.retry();
    }

    exportCsv(): void {
        if (!this.run() || !this.canExport()) return;
        this.mutation.run<string>(
            'GET',
            `/api/reports/${encodeURIComponent(this.id())}/export`,
            null,
            (csv) => {
                const url = URL.createObjectURL(
                        new Blob(['\uFEFF' + csv], {
                            type: 'text/csv;charset=utf-8',
                        }),
                    ),
                    link = document.createElement('a');
                link.href = url;
                link.download = `${this.id()}.csv`;
                link.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            },
        );
    }
}
