import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Session } from '../../core/session/session';
import { SupplierFacade } from './supplier-facade';
import { AssetSummary } from 'domain';

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SupplierFacade],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Procurement partners</p>
                <h1>Supplier details</h1>
            </div>
            <a
                class="button"
                routerLink="/suppliers"
            >
                Back to suppliers
            </a>
        </div>
        <section
            class="panel state"
            *ngIf="session.identity().role !== 'administrator'; else content"
        >
            <h2>Administrator identity required</h2>
        </section>
        <ng-template #content>
            <section
                class="panel detail-section"
                *ngIf="facade.detail$ | async as state"
            >
                <p
                    role="status"
                    *ngIf="state.loading || state.key !== facade.context.key()"
                >
                    Loading supplier…
                </p>
                <div
                    class="state"
                    role="alert"
                    *ngIf="state.error"
                >
                    <p>{{ state.error }}</p>
                    <button (click)="facade.retry()">Retry supplier</button>
                </div>
                <ng-container *ngIf="state.value as view">
                    <ng-container *ngIf="state.key === facade.context.key()">
                        <app-supplier-card
                            [record]="view.supplier"
                            [readOnly]="false"
                            (editRequested)="edit($event)"
                        />
                        <dl class="detail-facts">
                            <div>
                                <dt>Supplier ID</dt>
                                <dd>
                                    {{ view.supplier.id }} · Version
                                    {{ view.supplier.version }}
                                </dd>
                            </div>
                            <div>
                                <dt>Phone</dt>
                                <dd>
                                    {{ view.supplier.phone || 'Not provided' }}
                                </dd>
                            </div>
                            <div>
                                <dt>Notes</dt>
                                <dd>{{ view.supplier.notes || 'No notes' }}</dd>
                            </div>
                        </dl>
                        <h2>Supplied inventory</h2>
                        <p *ngIf="!view.assets.length">
                            No inventory uses this supplier yet.
                        </p>
                        <p *ngIf="view.assets.length > 25">
                            Showing the first 25 of
                            {{ view.assets.length }} assets.
                        </p>
                        <ul class="history-list">
                            <li
                                *ngFor="
                                    let asset of view.assets.slice(0, 25);
                                    trackBy: trackAsset
                                "
                            >
                                <a [routerLink]="['/assets', asset.id]">
                                    {{ asset.id }} · {{ asset.name }}
                                </a>
                                <span>{{ asset.status }}</span>
                            </li>
                        </ul>
                    </ng-container>
                </ng-container>
            </section>
        </ng-template>
    `,
})
export class SupplierDetailPage {
    constructor(
        readonly facade: SupplierFacade,
        readonly session: Session,
        private readonly router: Router,
        route: ActivatedRoute,
        destroy: DestroyRef,
    ) {
        route.paramMap
            .pipe(takeUntilDestroyed(destroy))
            .subscribe((params) =>
                facade.setRecord(params.get('id') ?? undefined),
            );
    }

    edit(id: string): void {
        void this.router.navigate(['/suppliers', id, 'edit']);
    }

    trackAsset(_index: number, asset: AssetSummary): string {
        return asset.id;
    }
}
