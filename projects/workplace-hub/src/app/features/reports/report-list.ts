import { DisplayLabel } from 'ui';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SavedReport, reportRole } from 'domain';
import { collectionResource } from '../../core/workflow-read';
import { Organization } from '../../core/organization';
import { Session } from '../../core/session/session';

@Component({
    imports: [RouterLink, DisplayLabel],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Reporting</p>
                <h1>Saved reports</h1>
                <p>
                    Save filters, then run them against current authorized
                    records.
                </p>
            </div>
            @if (canCreate()) {
                <a
                    class="button primary"
                    routerLink="/reports/new"
                >
                    Configure report
                </a>
            }
        </div>
        @if (!allowed()) {
            <section class="panel state">
                <h2>Manager or administrator required</h2>
            </section>
        } @else {
            <form
                class="toolbar"
                (submit)="$event.preventDefault(); search(searchInput.value)"
            >
                <label for="report-search">Search saved reports</label>
                <input
                    id="report-search"
                    #searchInput
                    [value]="query()"
                    placeholder="Report name"
                />
                <button type="submit">Search</button>
            </form>
            @if (organization.error()) {
                <p
                    class="notice"
                    role="alert"
                >
                    {{ organization.error() }}
                    <button (click)="organization.retry()">
                        Retry organization settings
                    </button>
                </p>
            }
            @if (organization.record() && !canCreate()) {
                <p class="notice">
                    Manager report creation is disabled by organization
                    settings.
                </p>
            }
            @if (reader.loading()) {
                <p role="status">Loading saved reports…</p>
            }
            @if (reader.error()) {
                <p
                    class="notice"
                    role="alert"
                >
                    {{ reader.error() }}
                    <button (click)="reader.retry()">Retry reports</button>
                </p>
            }
            @if (!reader.loading() && !reader.error()) {
                <div class="supplier-grid">
                    @for (report of reports(); track report.id) {
                        <section class="panel supplier-card">
                            <h2>
                                <a [routerLink]="['/reports', report.id]">
                                    {{ report.name }}
                                </a>
                            </h2>
                            <p>
                                {{ report.dataset | displayLabel }} ·
                                {{
                                    report.status || 'All statuses'
                                        | displayLabel
                                }}
                                ·
                                {{ report.personId || 'All visible people' }}
                            </p>
                            <small>
                                {{ report.id }} · Owner {{ report.ownerId }}
                            </small>
                        </section>
                    }
                </div>
                @if (!reports().length) {
                    <section class="panel state">
                        <h2>No saved reports found</h2>
                        <p>
                            Try another filter, configure a report or restore
                            normal responses.
                        </p>
                        <button (click)="reader.retry()">
                            Restore reports
                        </button>
                    </section>
                }
            }
        }
    `,
})
export class ReportList {
    private readonly session = inject(Session);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    readonly organization = inject(Organization);
    readonly allowed = computed(() => reportRole(this.session.identity().role));
    readonly canCreate = computed(
        () =>
            this.allowed() &&
            (this.session.identity().role === 'administrator' ||
                !!this.organization.record()?.managerCanCreateReports),
    );
    readonly reader = collectionResource<SavedReport>(() =>
        this.allowed() ? '/api/reports' : undefined,
    );
    private readonly params = toSignal(this.route.queryParamMap, {
        initialValue: this.route.snapshot.queryParamMap,
    });
    readonly query = computed(() => this.params().get('q') ?? '');
    readonly reports = computed(() =>
        this.reader
            .items()
            .filter((r) =>
                r.name
                    .toLowerCase()
                    .includes(this.query().trim().toLowerCase()),
            ),
    );

    search(q: string): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { q: q.trim() || null },
        });
    }
}
