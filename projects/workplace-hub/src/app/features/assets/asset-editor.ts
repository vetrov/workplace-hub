import {
    afterNextRender,
    Component,
    computed,
    effect,
    signal,
    untracked,
    ElementRef,
    inject,
    Injector,
    input,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssetDetail, AssetStatus, Supplier } from 'domain';
import { collectionResource, recordResource } from '../../core/workflow-read';
import { WorkflowClient } from '../../core/workflow-client';
import { reactiveEditor } from '../../core/reactive-editor';
import { trimmedText } from '../../core/form-validation';
import { Scenario } from '../../core/scenarios/scenario';
import { Session } from '../../core/session/session';

@Component({
    imports: [ReactiveFormsModule, RouterLink],
    providers: [WorkflowClient],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Inventory maintenance</p>
                <h1>Edit asset</h1>
                <p>Assigned inventory keeps its allocation and type.</p>
            </div>
            <a
                class="button"
                [routerLink]="['/assets', id()]"
            >
                Back to asset
            </a>
        </div>
        @if (!administrator()) {
            <section class="panel state">
                <h2>Administrator identity required</h2>
            </section>
        } @else {
            @if (reader.loading() && !editor.loaded()) {
                <p role="status">Loading asset…</p>
            }
            @if (reader.error() && !editor.loaded()) {
                <div
                    class="notice"
                    role="alert"
                >
                    {{ reader.error() }}
                    <button (click)="reader.retry()">Retry asset</button>
                </div>
            }
            @if (editor.loaded(); as asset) {
                <form
                    class="panel workflow-form"
                    [formGroup]="form"
                    (ngSubmit)="save()"
                    novalidate
                >
                    @if (editor.attempted() && form.invalid) {
                        <p
                            class="form-alert"
                            role="alert"
                        >
                            Check the asset fields below.
                        </p>
                    }
                    @if (mutation.error()) {
                        <p
                            class="form-alert"
                            role="alert"
                        >
                            {{ mutation.error() }}
                        </p>
                    }
                    @if (editor.feedback()) {
                        <p role="status">{{ editor.feedback() }}</p>
                    }
                    <div class="field">
                        <label for="edit-asset-name">Asset name</label>
                        <input
                            id="edit-asset-name"
                            formControlName="name"
                            maxlength="100"
                        />
                        @if (
                            editor.error(form.controls.name, 'Asset name');
                            as error
                        ) {
                            <small class="field-error">{{ error }}</small>
                        }
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="edit-asset-type">Type</label>
                            @if (asset.status === 'assigned') {
                                <p id="edit-asset-type">
                                    {{ asset.type }} · fixed while assigned
                                </p>
                            } @else {
                                <select
                                    id="edit-asset-type"
                                    formControlName="type"
                                >
                                    <option value="equipment">Equipment</option>
                                    <option value="software">Software</option>
                                </select>
                            }
                        </div>
                        <div class="field">
                            <label for="edit-asset-status">
                                Inventory status
                            </label>
                            @if (asset.status === 'assigned') {
                                <p id="edit-asset-status">
                                    Assigned · allocation protected
                                </p>
                            } @else {
                                <select
                                    id="edit-asset-status"
                                    formControlName="status"
                                >
                                    <option value="available">Available</option>
                                    <option value="maintenance">
                                        Maintenance
                                    </option>
                                    <option value="retired">Retired</option>
                                </select>
                            }
                        </div>
                    </div>
                    <div class="field">
                        <label for="edit-asset-supplier">Supplier</label>
                        <select
                            id="edit-asset-supplier"
                            formControlName="supplierId"
                        >
                            @for (
                                supplier of supplierOptions();
                                track supplier.id
                            ) {
                                <option [value]="supplier.id">
                                    {{ supplier.name }}
                                </option>
                            }
                        </select>
                        @if (suppliers.loading()) {
                            <p role="status">Loading suppliers…</p>
                        }
                        @if (suppliers.error()) {
                            <p role="alert">
                                {{ suppliers.error() }}
                                <button
                                    type="button"
                                    (click)="suppliers.retry()"
                                >
                                    Retry suppliers
                                </button>
                            </p>
                        }
                        @if (
                            !suppliers.loading() &&
                            !suppliers.error() &&
                            !supplierOptions().length
                        ) {
                            <p>
                                No supplier options. Restore normal responses
                                before saving.
                            </p>
                            <button
                                type="button"
                                (click)="suppliers.retry()"
                            >
                                Restore suppliers
                            </button>
                        }
                    </div>
                    <div class="field">
                        <label for="edit-asset-serial">
                            Serial or license identifier
                        </label>
                        <input
                            id="edit-asset-serial"
                            formControlName="serialNumber"
                            maxlength="80"
                        />
                        @if (
                            editor.error(
                                form.controls.serialNumber,
                                'Identifier'
                            );
                            as error
                        ) {
                            <small class="field-error">{{ error }}</small>
                        }
                    </div>
                    <div class="field">
                        <label for="edit-asset-notes">Notes (optional)</label>
                        <textarea
                            id="edit-asset-notes"
                            formControlName="notes"
                            rows="3"
                            maxlength="1000"
                        ></textarea>
                        @if (
                            editor.error(form.controls.notes, 'Notes');
                            as error
                        ) {
                            <small class="field-error">{{ error }}</small>
                        }
                    </div>
                    <div class="form-actions">
                        <p>
                            {{ asset.id }} · Version {{ asset.version }} ·
                            {{
                                form.dirty ? 'Unsaved changes' : 'Saved values'
                            }}
                        </p>
                        <button
                            class="primary"
                            type="submit"
                            [disabled]="
                                mutation.busy() ||
                                suppliers.loading() ||
                                !supplierOptions().length
                            "
                        >
                            {{
                                mutation.busy() ? 'Saving asset…' : 'Save asset'
                            }}
                        </button>
                    </div>
                    <button
                        type="button"
                        [disabled]="mutation.busy()"
                        (click)="reload()"
                    >
                        Reload saved asset
                    </button>
                </form>
            }
        }
    `,
})
export class AssetEditor {
    readonly id = input.required<string>();
    private readonly session = inject(Session);
    private readonly injector = inject(Injector);
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly mutation = inject(WorkflowClient);
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly reader = recordResource<AssetDetail>(() =>
        this.administrator()
            ? `/api/assets/${encodeURIComponent(this.id())}`
            : undefined,
    );
    readonly suppliers = collectionResource<Supplier>(() =>
        this.administrator() ? '/api/supplier-options' : undefined,
    );
    readonly supplierOptions = signal<readonly Supplier[]>([]);
    private readonly scenario = inject(Scenario);

    constructor() {
        effect(() => {
            this.session.epoch();
            this.scenario.resetVersion();
            untracked(() => this.supplierOptions.set([]));
        });
        effect(() => {
            const options = this.suppliers.items();
            if (options.length) this.supplierOptions.set(options);
        });
    }

    readonly form = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [trimmedText(3, 100)],
        }),
        type: new FormControl<'equipment' | 'software'>('equipment', {
            nonNullable: true,
        }),
        status: new FormControl<AssetStatus>('available', {
            nonNullable: true,
        }),
        supplierId: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        serialNumber: new FormControl('', {
            nonNullable: true,
            validators: [trimmedText(3, 80)],
        }),
        notes: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(1000)],
        }),
    });
    readonly editor = reactiveEditor(
        this.form,
        this.reader.record,
        () => this.id(),
        (record) => ({ ...record }),
    );

    canLeave(): boolean {
        return this.editor.canLeave();
    }

    reload(): void {
        if (this.canLeave()) {
            this.editor.clear();
            this.reader.retry();
        }
    }

    save(): void {
        if (!this.administrator() || !this.editor.loaded()) return;
        if (!this.editor.valid()) {
            afterNextRender(
                {
                    write: () =>
                        this.element.nativeElement
                            .querySelector<HTMLElement>('.ng-invalid:not(form)')
                            ?.focus(),
                },
                { injector: this.injector },
            );
            return;
        }
        if (
            !this.supplierOptions().some(
                (s) => s.id === this.form.controls.supplierId.value,
            )
        )
            return;
        this.mutation.run<AssetDetail>(
            'PATCH',
            `/api/assets/${encodeURIComponent(this.id())}`,
            {
                ...this.form.getRawValue(),
                version: this.editor.loaded()!.version,
            },
            (record) => {
                this.editor.load(record);
                this.editor.feedback.set(
                    `Asset saved. Version ${record.version}.`,
                );
            },
        );
    }
}
