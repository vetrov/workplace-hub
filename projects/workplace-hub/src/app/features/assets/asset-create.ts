import {
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetDetail, Supplier } from 'domain';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { WorkflowClient } from '../../core/workflow-client';
import { collectionResource } from '../../core/workflow-read';
import { fieldError, trimmedText } from '../../core/form-validation';

@Component({
    imports: [ReactiveFormsModule, RouterLink],
    providers: [WorkflowClient],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Inventory management</p>
                <h1>Create an asset</h1>
                <p>Add equipment or software ready for assignment.</p>
            </div>
            <a
                class="button"
                routerLink="/assets"
            >
                Back to inventory
            </a>
        </div>
        @if (!administrator()) {
            <section
                class="panel state"
                role="alert"
            >
                <h2>Administrator identity required</h2>
                <p>Switch to Taylor Patel to create inventory.</p>
            </section>
        } @else {
            <form
                class="panel workflow-form"
                [formGroup]="form"
                (ngSubmit)="save()"
            >
                @if (mutation.error()) {
                    <p
                        class="form-alert"
                        role="alert"
                    >
                        {{ mutation.error() }}
                    </p>
                }
                <fieldset [disabled]="mutation.busy()">
                    <legend class="sr-only">New inventory record</legend>
                    <div class="field">
                        <label for="asset-name">Asset name</label>
                        <input
                            id="asset-name"
                            formControlName="name"
                            maxlength="100"
                        />
                        @if (error('name'); as message) {
                            <small class="field-error">{{ message }}</small>
                        }
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="asset-type">Type</label>
                            <select
                                id="asset-type"
                                formControlName="type"
                            >
                                <option value="equipment">Equipment</option>
                                <option value="software">Software</option>
                            </select>
                        </div>
                        <div class="field">
                            <label for="asset-supplier">Supplier</label>
                            @if (suppliers.loading()) {
                                <small role="status">Loading suppliers…</small>
                            }
                            @if (suppliers.error()) {
                                <div role="alert">
                                    <p>{{ suppliers.error() }}</p>
                                    <button
                                        type="button"
                                        (click)="suppliers.retry()"
                                    >
                                        Retry suppliers
                                    </button>
                                </div>
                            } @else if (
                                !suppliers.loading() &&
                                !supplierOptions().length
                            ) {
                                <small>
                                    No suppliers are available. Reset the demo
                                    to restore options.
                                </small>
                            }
                            @if (supplierError()) {
                                <small
                                    class="field-error"
                                    role="alert"
                                >
                                    {{ supplierError() }}
                                </small>
                            }
                            <select
                                id="asset-supplier"
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
                        </div>
                    </div>
                    <div class="field">
                        <label for="asset-serial">
                            Serial or license identifier
                        </label>
                        <input
                            id="asset-serial"
                            formControlName="serialNumber"
                            maxlength="80"
                        />
                        @if (error('serialNumber'); as message) {
                            <small class="field-error">{{ message }}</small>
                        }
                    </div>
                    <div class="field">
                        <label for="asset-notes">Notes (optional)</label>
                        <textarea
                            id="asset-notes"
                            formControlName="notes"
                            maxlength="1000"
                            rows="3"
                        ></textarea>
                    </div>
                    <div class="form-actions">
                        <p>New assets are available and unassigned.</p>
                        <button
                            type="submit"
                            class="primary"
                            [disabled]="
                                suppliers.loading() || !supplierOptions().length
                            "
                        >
                            {{ mutation.busy() ? 'Creating…' : 'Create asset' }}
                        </button>
                    </div>
                </fieldset>
            </form>
        }
    `,
})
export class AssetCreate {
    private readonly session = inject(Session);
    private readonly scenario = inject(Scenario);
    private readonly router = inject(Router);
    readonly mutation = inject(WorkflowClient);
    private readonly document = inject(DOCUMENT);
    private readonly optionsScope = computed(
        () => `${this.session.epoch()}:${this.scenario.resetVersion()}`,
    );
    private readonly loadedOptions = signal<
        { scope: string; items: readonly Supplier[] } | undefined
    >(undefined);
    readonly supplierError = signal('');
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly suppliers = collectionResource<Supplier>(() =>
        this.administrator() ? '/api/supplier-options' : undefined,
    );

    readonly supplierOptions = computed(() => {
        const current = this.suppliers.items();
        if (current.length) return current;
        const saved = this.loadedOptions();
        return saved?.scope === this.optionsScope() ? saved.items : [];
    });

    readonly form = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [trimmedText(3, 100)],
        }),
        type: new FormControl<'equipment' | 'software'>('equipment', {
            nonNullable: true,
        }),
        supplierId: new FormControl('S001', {
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

    constructor() {
        const cdr = inject(ChangeDetectorRef);
        this.form.events
            .pipe(takeUntilDestroyed())
            .subscribe(() => cdr.markForCheck());
        effect(() => {
            this.session.epoch();
            this.scenario.resetVersion();
            this.form.reset();
            this.supplierError.set('');
        });
        effect(() => {
            const choices = this.suppliers.items();
            if (choices.length)
                this.loadedOptions.set({
                    scope: this.optionsScope(),
                    items: choices,
                });
        });
        effect(() => {
            if (this.mutation.busy()) this.form.disable({ emitEvent: false });
            else this.form.enable({ emitEvent: false });
        });
    }

    error(name: keyof AssetCreate['form']['controls']): string {
        const c = this.form.controls[name];
        return c.invalid && c.touched
            ? fieldError(
                  c,
                  {
                      name: 'Asset name',
                      type: 'Type',
                      supplierId: 'Supplier',
                      serialNumber: 'Identifier',
                      notes: 'Notes',
                  }[name],
              )
            : '';
    }

    canLeave(): boolean {
        return (
            !this.mutation.busy() &&
            (!this.form.dirty ||
                (this.document.defaultView?.confirm(
                    'Discard unsaved asset changes?',
                ) ??
                    false))
        );
    }

    save(): void {
        if (this.mutation.busy() || !this.administrator()) return;

        this.form.markAllAsTouched();
        this.supplierError.set('');
        if (!this.form.valid) return;
        if (
            !this.supplierOptions().some(
                (s) => s.id === this.form.controls.supplierId.value,
            )
        ) {
            this.supplierError.set(
                'Choose an available supplier. Retry suppliers or reset the demo to restore choices.',
            );
            return;
        }
        this.mutation.run<AssetDetail>(
            'POST',
            '/api/assets',
            this.form.getRawValue(),
            (record) => {
                this.form.markAsPristine();
                void this.router.navigate(['/assets', record.id]);
            },
        );
    }
}
