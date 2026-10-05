import {
    afterNextRender,
    ElementRef,
    Injector,
    viewChild,
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
import { Organization } from '../../core/organization';
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
    private readonly injector = inject(Injector);
    private readonly formElement =
        viewChild<ElementRef<HTMLFormElement>>('requestForm');
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
        if (this.mutation.busy() || !this.employee() || !this.editable())
            return;

        if (this.step() === 1) {
            const controls = [
                this.form.controls.title,
                this.form.controls.justification,
                this.form.controls.category,
                this.form.controls.delivery,
            ];
            controls.forEach((c) => c.markAllAsTouched());
            if (controls.some((c) => !c.valid)) {
                this.focusInvalid(1);
                return;
            }
        } else {
            this.form.controls.items.markAllAsTouched();
            if (!this.form.controls.items.valid) {
                this.focusInvalid(2);
                return;
            }
        }
        this.focusStep(Math.min(3, this.step() + 1));
    }

    save(status: 'draft' | 'submitted'): void {
        if (this.mutation.busy() || !this.employee() || !this.editable())
            return;

        this.attempted.set(true);
        this.form.markAllAsTouched();
        if (!this.form.valid) {
            const invalidStep = this.fields(1).some(
                ([control]) => !control.valid,
            )
                ? 1
                : 2;
            this.focusInvalid(invalidStep);
            return;
        }
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

    back(): void {
        if (!this.mutation.busy()) this.focusStep(Math.max(1, this.step() - 1));
    }

    private fields(step: number): readonly [AbstractControl, string][] {
        if (step === 1)
            return [
                [this.form.controls.title, 'request-title'],
                [this.form.controls.category, 'request-category'],
                [this.form.controls.justification, 'request-justification'],
                [
                    this.form.controls.delivery.controls.location,
                    'delivery-location',
                ],
                [this.form.controls.delivery.controls.neededBy, 'needed-by'],
            ];
        return this.form.controls.items.controls.flatMap(
            (row, i): [AbstractControl, string][] => [
                [row.controls.description, `item-description-${i}`],
                [row.controls.quantity, `item-quantity-${i}`],
                [row.controls.unitCost, `item-cost-${i}`],
            ],
        );
    }

    private focusInvalid(step: number): void {
        const field = this.fields(step).find(([control]) => !control.valid);
        if (field) this.focusField(step, field[1]);
    }

    private focusStep(step: number): void {
        this.focusField(
            step,
            step === 3 ? 'request-review' : this.fields(step)[0][1],
        );
    }

    private focusField(step: number, fieldId: string): void {
        this.step.set(step);
        const epoch = this.session.epoch(),
            reset = this.scenario.resetVersion(),
            requestId = this.id();
        afterNextRender(
            {
                write: () => {
                    if (
                        this.step() !== step ||
                        this.id() !== requestId ||
                        this.session.epoch() !== epoch ||
                        this.scenario.resetVersion() !== reset ||
                        this.mutation.busy()
                    )
                        return;
                    this.formElement()
                        ?.nativeElement.querySelector<HTMLElement>(
                            `#${fieldId}`,
                        )
                        ?.focus();
                },
            },
            { injector: this.injector },
        );
    }

    canLeave(): boolean {
        return (
            !this.mutation.busy() &&
            (!this.form.dirty ||
                (this.document.defaultView?.confirm(
                    'Discard unsaved request changes?',
                ) ??
                    false))
        );
    }
}
