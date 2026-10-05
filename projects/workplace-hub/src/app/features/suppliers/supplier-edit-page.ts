import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    Injector,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, CanDeactivateFn, Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, skip } from 'rxjs';
import { SupplierDetail, SupplierInput } from 'domain';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { SupplierFacade } from './supplier-facade';
import { SupplierEditor } from './supplier-editor';

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SupplierFacade],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Procurement partners</p>
                <h1>{{ id ? 'Edit supplier' : 'Create supplier' }}</h1>
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
            <p
                role="status"
                *ngIf="loading && !initialized"
            >
                Loading supplier…
            </p>
            <div
                class="panel state"
                role="alert"
                *ngIf="readError && !initialized"
            >
                <p>{{ readError }}</p>
                <button (click)="reload()">Retry supplier</button>
            </div>
            <p
                class="form-alert"
                role="alert"
                *ngIf="facade.saveError | async as error"
            >
                {{ error }}
            </p>
            <app-supplier-editor
                *ngIf="initialized"
                [record]="record"
                [busy]="!!(facade.busy | async)"
                (saved)="save($event)"
            />
            <button
                type="button"
                *ngIf="initialized && id"
                (click)="reload()"
            >
                Reload saved supplier
            </button>
        </ng-template>
    `,
})
export class SupplierEditPage {
    @ViewChild(SupplierEditor) editor?: SupplierEditor;
    id: string | undefined;
    record: SupplierDetail | null = null;
    initialized = false;
    loading = false;
    readError = '';

    constructor(
        readonly facade: SupplierFacade,
        readonly session: Session,
        scenario: Scenario,
        route: ActivatedRoute,
        private readonly router: Router,
        cdr: ChangeDetectorRef,
        destroy: DestroyRef,
        injector: Injector,
    ) {
        route.paramMap.pipe(takeUntilDestroyed(destroy)).subscribe((params) => {
            this.id = params.get('id') ?? undefined;
            this.clear();
            facade.setRecord(this.id);
            cdr.markForCheck();
        });
        combineLatest([
            toObservable(session.epoch, { injector }),
            toObservable(scenario.resetVersion, { injector }),
        ])
            .pipe(skip(1), takeUntilDestroyed(destroy))
            .subscribe(() => {
                this.clear();
                cdr.markForCheck();
            });
        facade.detail$.pipe(takeUntilDestroyed(destroy)).subscribe((state) => {
            this.loading = state.loading;
            this.readError = state.error;
            if (
                state.key === facade.context.key() &&
                state.value &&
                !this.initialized
            ) {
                this.record = state.value.supplier;
                this.initialized = true;
            }
            cdr.markForCheck();
        });
    }

    private clear(): void {
        this.editor?.resetDraft();
        this.record = null;
        this.initialized = !this.id;
        this.readError = '';
    }

    canLeave(): boolean {
        return (
            !this.facade.busy.value &&
            (!this.editor?.form.dirty ||
                window.confirm('Discard unsaved supplier changes?'))
        );
    }

    reload(): void {
        if (!this.canLeave()) return;
        this.clear();
        this.facade.retry();
    }

    save(input: SupplierInput): void {
        if (this.session.identity().role !== 'administrator') return;
        this.facade.save(
            this.id,
            {
                ...input,
                ...(this.record ? { version: this.record.version } : {}),
            },
            (record) => {
                this.editor?.markSaved();
                void this.router.navigate(['/suppliers', record.id]);
            },
        );
    }
}

export const supplierChangesGuard: CanDeactivateFn<SupplierEditPage> = (page) =>
    page.canLeave();
