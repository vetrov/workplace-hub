import {
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    inject,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetDetail } from 'domain';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { WorkflowClient } from '../../core/workflow-client';
import { INITIAL_DATA } from '../../core/mock-http/seed-data';
import { fieldError, trimmedText } from '../requests/request-form';

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
                            <select
                                id="asset-supplier"
                                formControlName="supplierId"
                            >
                                @for (
                                    supplier of suppliers;
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
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly suppliers = INITIAL_DATA.suppliers;

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
            this.session.identity().personId;
            this.scenario.resetVersion();
            this.form.reset();
        });
        effect(() => {
            if (this.mutation.busy()) this.form.disable({ emitEvent: false });
            else this.form.enable({ emitEvent: false });
        });
    }

    error(name: keyof AssetCreate['form']['controls']): string {
        const c = this.form.controls[name];
        return c.invalid && c.touched
            ? fieldError(c, name === 'name' ? 'Asset name' : 'Identifier')
            : '';
    }

    save(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid || !this.administrator()) return;
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
