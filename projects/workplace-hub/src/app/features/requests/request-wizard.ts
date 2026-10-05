import { Organization } from '../../core/organization';
import {
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { canEditRequest, RequestDetail, requestTotal } from 'domain';
import { MoneyInput } from 'ui';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { WorkflowClient } from '../../core/workflow-client';
import { recordResource } from '../../core/workflow-read';
import {
    createRequestForm,
    createRequestLine,
    fieldError,
} from './request-form';

@Component({
    imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, MoneyInput],
    providers: [WorkflowClient],
    templateUrl: './request-wizard.html',
})
export class RequestWizard {
    readonly id = input<string>();
    readonly session = inject(Session);
    readonly organization = inject(Organization);
    readonly categoryChoices = computed(() =>
        (['equipment', 'software'] as const).map((id) => ({
            id,
            label:
                this.organization.record()?.categories.find((c) => c.id === id)
                    ?.label ?? id,
            enabled:
                this.organization.record()?.categories.find((c) => c.id === id)
                    ?.enabled ?? true,
        })),
    );
    private readonly scenario = inject(Scenario);
    private readonly router = inject(Router);
    private readonly document = inject(DOCUMENT);
    readonly mutation = inject(WorkflowClient);
    readonly reader = recordResource<RequestDetail>(() =>
        this.id()
            ? `/api/requests/${encodeURIComponent(this.id()!)}`
            : undefined,
    );
    readonly form = createRequestForm();
    readonly step = signal(1);
    readonly attempted = signal(false);
    private readonly formVersion = signal(0);
    private version = 0;

    readonly values = computed(() => {
        this.formVersion();
        return this.form.getRawValue();
    });

    readonly total = computed(() => requestTotal(this.values().items));
    readonly employee = computed(
        () => this.session.identity().role === 'employee',
    );

    readonly editable = computed(
        () =>
            !this.id() ||
            (!!this.reader.record() &&
                canEditRequest(this.reader.record()!, this.session.identity())),
    );

    readonly errors = computed(() => {
        this.formVersion();
        const fields: [AbstractControl, string][] = [
            [this.form.controls.title, 'Title'],
            [this.form.controls.justification, 'Justification'],
            [this.form.controls.category, 'Category'],
            [this.form.controls.delivery.controls.location, 'Location'],
            [this.form.controls.delivery.controls.neededBy, 'Delivery date'],
        ];
        this.form.controls.items.controls.forEach((row, i) =>
            fields.push(
                [row.controls.description, `Item ${i + 1} description`],
                [row.controls.quantity, `Item ${i + 1} quantity`],
                [row.controls.unitCost, `Item ${i + 1} unit cost`],
            ),
        );
        return fields
            .filter(([control]) => control.invalid)
            .map(([control, label]) => fieldError(control, label));
    });

    constructor() {
        const cdr = inject(ChangeDetectorRef);
        this.form.events.pipe(takeUntilDestroyed()).subscribe(() => {
            this.formVersion.update((v) => v + 1);
            cdr.markForCheck();
        });
        effect(() => {
            this.id();
            this.session.identity().personId;
            this.scenario.resetVersion();
            untracked(() => this.clear());
        });
        effect(() => {
            const record = this.reader.record();
            if (
                record &&
                record.version !== this.version &&
                canEditRequest(record, this.session.identity())
            )
                untracked(() => {
                    this.form.controls.items.clear();
                    record.items.forEach((item) =>
                        this.form.controls.items.push(createRequestLine(item)),
                    );
                    this.form.patchValue({
                        title: record.title,
                        justification: record.justification,
                        category: record.category,
                        delivery: record.delivery,
                    });
                    this.version = record.version;
                    this.form.markAsPristine();
                });
        });
        effect(() => {
            if (this.mutation.busy()) this.form.disable({ emitEvent: false });
            else this.form.enable({ emitEvent: false });
        });
    }

    private clear(): void {
        this.version = 0;
        this.step.set(1);
        this.attempted.set(false);
        this.form.controls.items.clear();
        this.form.controls.items.push(createRequestLine());
        this.form.reset();
        this.form.markAsPristine();
    }

    error(control: AbstractControl, label: string): string {
        return control.invalid && (control.touched || this.attempted())
            ? fieldError(control, label)
            : '';
    }

    addItem(): void {
        if (this.form.controls.items.length < 10) {
            this.form.controls.items.push(createRequestLine());
            this.form.markAsDirty();
        }
    }

    removeItem(index: number): void {
        if (this.form.controls.items.length > 1) {
            this.form.controls.items.removeAt(index);
            this.form.markAsDirty();
        }
    }

    next(): void {
        if (this.step() === 1) {
            const controls = [
                this.form.controls.title,
                this.form.controls.justification,
                this.form.controls.category,
                this.form.controls.delivery,
            ];
            controls.forEach((c) => c.markAllAsTouched());
            if (controls.some((c) => c.invalid)) return;
        } else {
            this.form.controls.items.markAllAsTouched();
            if (this.form.controls.items.invalid) return;
        }
        this.step.update((n) => Math.min(3, n + 1));
    }

    save(status: 'draft' | 'submitted'): void {
        this.attempted.set(true);
        this.form.markAllAsTouched();
        if (
            this.form.invalid ||
            this.mutation.busy() ||
            !this.employee() ||
            !this.editable()
        )
            return;
        const id = this.id();
        this.mutation.run<RequestDetail>(
            id ? 'PATCH' : 'POST',
            id ? `/api/requests/${id}` : '/api/requests',
            {
                ...this.form.getRawValue(),
                status,
                ...(id ? { version: this.version } : {}),
            },
            (record) => {
                this.form.markAsPristine();
                void this.router.navigate(['/requests', record.id]);
            },
        );
    }

    canLeave(): boolean {
        return (
            !this.form.dirty ||
            (this.document.defaultView?.confirm(
                'Discard unsaved request changes?',
            ) ??
                false)
        );
    }
}
