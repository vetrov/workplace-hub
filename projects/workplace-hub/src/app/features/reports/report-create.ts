import {
    afterNextRender,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    Injector,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
    Person,
    ReportDataset,
    SavedReport,
    REPORT_STATUSES,
    reportRole,
} from 'domain';
import { EmployeePicker, DisplayLabel } from 'ui';
import { collectionResource } from '../../core/workflow-read';
import { WorkflowClient } from '../../core/workflow-client';
import { Organization } from '../../core/organization';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { fieldError, trimmedText } from '../../core/form-validation';

@Component({
    imports: [RouterLink, ReactiveFormsModule, EmployeePicker, DisplayLabel],
    providers: [WorkflowClient],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Reporting</p>
                <h1>Configure report</h1>
                <p>
                    Saved filters never grant access beyond your current
                    permissions.
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
        } @else if (!canCreate() && organization.record()) {
            <section class="panel state">
                <h2>Manager report creation is disabled</h2>
                <a routerLink="/reports">View existing reports</a>
            </section>
        } @else {
            @if (organization.loading() && !organization.record()) {
                <p role="status">Loading report defaults…</p>
            }
            @if (organization.error()) {
                <p
                    class="notice"
                    role="alert"
                >
                    {{ organization.error() }}
                    <button (click)="organization.retry()">
                        Retry report defaults
                    </button>
                </p>
            }
            <form
                class="panel workflow-form"
                [formGroup]="form"
                (ngSubmit)="save()"
                novalidate
            >
                @if (mutation.error()) {
                    <p
                        class="form-alert"
                        role="alert"
                    >
                        {{ mutation.error() }}
                    </p>
                }
                <div class="field">
                    <label for="report-name">Report name</label>
                    <input
                        #nameInput
                        id="report-name"
                        formControlName="name"
                        maxlength="100"
                    />
                    @if (error(form.controls.name, 'Report name'); as message) {
                        <small class="field-error">{{ message }}</small>
                    }
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="report-dataset">Dataset</label>
                        <select
                            id="report-dataset"
                            formControlName="dataset"
                            (change)="datasetChanged()"
                        >
                            <option value="requests">Requests</option>
                            <option value="assets">Assets</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="report-status">Status filter</label>
                        <select
                            id="report-status"
                            formControlName="status"
                        >
                            <option value="">All statuses</option>
                            @for (status of statuses(); track status) {
                                <option [value]="status">
                                    {{ status | displayLabel }}
                                </option>
                            }
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="report-person">Person filter (optional)</label>
                    <ui-employee-picker
                        fieldId="report-person"
                        label="Person filter"
                        emptyLabel="All visible people"
                        [options]="personOptions()"
                        formControlName="personId"
                    />
                    @if (people.loading()) {
                        <p role="status">Loading people filters…</p>
                    }
                    @if (people.error()) {
                        <p role="alert">
                            {{ people.error() }}
                            <button
                                type="button"
                                (click)="people.retry()"
                            >
                                Retry people filters
                            </button>
                        </p>
                    }
                    @if (
                        error(form.controls.personId, 'Person filter');
                        as message
                    ) {
                        <small class="field-error">{{ message }}</small>
                    }
                </div>
                <div class="form-actions">
                    <p>
                        {{
                            form.dirty
                                ? 'Unsaved report configuration'
                                : 'New report'
                        }}
                        · managers see their own reports
                    </p>
                    <button
                        type="submit"
                        class="primary"
                        [disabled]="mutation.busy() || !canCreate()"
                    >
                        {{ mutation.busy() ? 'Saving report…' : 'Save report' }}
                    </button>
                </div>
            </form>
        }
    `,
})
export class ReportCreate {
    private readonly session = inject(Session);
    private readonly scenario = inject(Scenario);
    private readonly router = inject(Router);
    private readonly injector = inject(Injector);
    readonly organization = inject(Organization);
    readonly mutation = inject(WorkflowClient);
    readonly allowed = computed(() => reportRole(this.session.identity().role));
    readonly canCreate = computed(
        () =>
            this.allowed() &&
            (this.session.identity().role === 'administrator' ||
                !!this.organization.record()?.managerCanCreateReports),
    );
    readonly people = collectionResource<Person>(() =>
        this.allowed() ? '/api/people-options' : undefined,
    );
    private readonly peopleCache = signal<readonly Person[]>([]);
    readonly personOptions = computed(() =>
        this.peopleCache()
            .filter(
                (p) =>
                    this.session.identity().role === 'administrator' ||
                    p.teamId === this.session.identity().teamId,
            )
            .map((p) => ({ value: p.id, label: p.name })),
    );
    private readonly nameInput =
        viewChild<ElementRef<HTMLInputElement>>('nameInput');
    readonly form = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [trimmedText(3, 100)],
        }),
        dataset: new FormControl<ReportDataset>('requests', {
            nonNullable: true,
        }),
        status: new FormControl('', { nonNullable: true }),
        personId: new FormControl<string | null>(null),
    });
    private readonly defaultsApplied = signal(false);

    constructor() {
        const cdr = inject(ChangeDetectorRef);
        this.form.events
            .pipe(takeUntilDestroyed())
            .subscribe(() => cdr.markForCheck());
        effect(() => {
            this.session.epoch();
            this.scenario.resetVersion();
            untracked(() => {
                this.form.reset();
                this.peopleCache.set([]);
                this.defaultsApplied.set(false);
            });
        });
        effect(() => {
            const record = this.organization.record();
            if (record && (!this.defaultsApplied() || !this.form.dirty)) {
                untracked(() => {
                    if (!this.form.dirty)
                        this.form.controls.dataset.setValue(
                            record.defaultReportDataset,
                        );
                    this.defaultsApplied.set(true);
                });
            }
        });
        effect(() => {
            const people = this.people.items();
            if (people.length) this.peopleCache.set(people);
        });
        effect(() => {
            if (this.mutation.busy()) this.form.disable({ emitEvent: false });
            else this.form.enable({ emitEvent: false });
        });
        this.form.controls.status.addValidators((c) =>
            !c.value ||
            REPORT_STATUSES[this.form.controls.dataset.value].includes(c.value)
                ? null
                : { status: true },
        );
    }

    statuses(): readonly string[] {
        return REPORT_STATUSES[this.form.controls.dataset.value];
    }

    datasetChanged(): void {
        this.form.controls.status.setValue('');
    }

    error(control: FormControl, label: string): string {
        return control.touched && control.invalid
            ? fieldError(control, label)
            : '';
    }

    canLeave(): boolean {
        return (
            !this.mutation.busy() &&
            (!this.form.dirty ||
                window.confirm('Discard unsaved report configuration?'))
        );
    }

    save(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            afterNextRender(
                { write: () => this.nameInput()?.nativeElement.focus() },
                { injector: this.injector },
            );
            return;
        }
        if (!this.canCreate()) return;
        this.mutation.run<SavedReport>(
            'POST',
            '/api/reports',
            {
                ...this.form.getRawValue(),
                personId: this.form.controls.personId.value ?? '',
            },
            (report) => {
                this.form.markAsPristine();
                void this.router.navigate(['/reports', report.id]);
            },
        );
    }
}
