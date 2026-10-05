import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Session } from '../../core/session/session';
import { SupplierFacade } from './supplier-facade';
import { SupplierDetail } from 'domain';

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SupplierFacade],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Procurement partners</p>
                <h1>Suppliers</h1>
                <p>Find contacts and the inventory they provide.</p>
            </div>
            <a
                class="button primary"
                routerLink="/suppliers/new"
                *ngIf="session.identity().role === 'administrator'"
            >
                Create supplier
            </a>
        </div>
        <section
            class="panel state"
            *ngIf="session.identity().role !== 'administrator'; else directory"
        >
            <h2>Administrator identity required</h2>
            <p>Supplier contacts are restricted to administrators.</p>
        </section>
        <ng-template #directory>
            <section
                class="panel"
                *ngIf="facade.directory$ | async as state"
            >
                <form
                    class="toolbar"
                    (submit)="
                        $event.preventDefault(); search(searchInput.value)
                    "
                >
                    <div class="field search-field">
                        <label for="supplier-search">Search suppliers</label>
                        <input
                            id="supplier-search"
                            #searchInput
                            type="search"
                            [value]="searchText"
                            placeholder="Organization or contact email"
                        />
                    </div>
                    <button type="submit">Search</button>
                </form>
                <div
                    class="state"
                    role="status"
                    *ngIf="state.loading || state.key !== facade.context.key()"
                >
                    Loading suppliers…
                </div>
                <div
                    class="state"
                    role="alert"
                    *ngIf="state.error"
                >
                    <p>{{ state.error }}</p>
                    <button (click)="facade.retry()">Retry suppliers</button>
                </div>
                <ng-container *ngIf="state.value as page">
                    <ng-container *ngIf="state.key === facade.context.key()">
                        <div
                            class="state"
                            *ngIf="!page.items.length"
                        >
                            <h2>No suppliers found</h2>
                            <p>Change your search or reset the demo.</p>
                        </div>
                        <div class="supplier-grid">
                            <div
                                *ngFor="
                                    let supplier of page.items;
                                    trackBy: trackSupplier
                                "
                            >
                                <app-supplier-card
                                    [record]="supplier"
                                    readOnly
                                />
                                <a [routerLink]="['/suppliers', supplier.id]">
                                    Open {{ supplier.name }}
                                </a>
                            </div>
                        </div>
                        <div class="pagination">
                            <span>
                                {{ page.total }} suppliers · Page
                                {{ page.page }}
                            </span>
                            <button
                                [disabled]="page.page <= 1"
                                (click)="pageTo(page.page - 1)"
                            >
                                Previous
                            </button>
                            <button
                                [disabled]="
                                    page.page * page.pageSize >= page.total
                                "
                                (click)="pageTo(page.page + 1)"
                            >
                                Next
                            </button>
                        </div>
                    </ng-container>
                </ng-container>
            </section>
        </ng-template>
    `,
})
export class SupplierDirectory {
    searchText = '';

    constructor(
        readonly facade: SupplierFacade,
        readonly session: Session,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        destroy: DestroyRef,
    ) {
        route.queryParamMap
            .pipe(takeUntilDestroyed(destroy))
            .subscribe((params) => {
                const page = Number(params.get('page'));
                this.searchText = (params.get('q') ?? '').trim();
                facade.setQuery({
                    q: this.searchText,
                    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
                });
            });
    }

    trackSupplier(_index: number, supplier: SupplierDetail): string {
        return supplier.id;
    }

    search(q: string): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { q: q.trim() || null, page: null },
        });
    }

    pageTo(page: number): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page },
            queryParamsHandling: 'merge',
        });
    }
}
