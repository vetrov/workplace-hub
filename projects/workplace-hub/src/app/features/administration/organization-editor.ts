import {
    afterNextRender,
    Component,
    computed,
    ElementRef,
    inject,
    Injector,
    input,
    signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    OrganizationSettings,
    ReportDataset,
    RequestCategory,
    RequestCategoryConfig,
    RoleConfiguration,
} from 'domain';
import { DisplayLabel } from 'ui';
import { collectionResource, recordResource } from '../../core/workflow-read';
import { WorkflowClient } from '../../core/workflow-client';
import { reactiveEditor } from '../../core/reactive-editor';
import { trimmedText } from '../../core/form-validation';
import { Session } from '../../core/session/session';

export type OrganizationSection = 'roles' | 'categories' | 'settings';

@Component({
    imports: [RouterLink, ReactiveFormsModule, DisplayLabel],
    providers: [WorkflowClient],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Administration</p>
                <h1>{{ heading() }}</h1>
                <p>{{ description() }}</p>
            </div>
            <a
                class="button"
                routerLink="/administration/policies"
            >
                Purchasing policies
            </a>
        </div>
        <nav
            class="detail-actions administration-links"
            aria-label="Administration sections"
        >
            <a routerLink="/administration/roles">Roles</a>
            <a routerLink="/administration/categories">Categories</a>
            <a routerLink="/administration/settings">Organization settings</a>
        </nav>
        @if (!administrator()) {
            <section class="panel state">
                <h2>Administrator identity required</h2>
            </section>
        } @else {
            @if (loading() && !loaded()) {
                <p role="status">Loading saved configuration…</p>
            }
            @if (error() && !loaded()) {
                <section
                    class="panel state"
                    role="alert"
                >
                    <p>{{ error() }}</p>
                    <button (click)="retry()">Retry configuration</button>
                </section>
            }
            @if (error() && loaded()) {
                <div
                    class="notice"
                    role="alert"
                >
                    <p>
                        Saved configuration could not be refreshed.
                        {{ error() }}
                    </p>
                    <button (click)="retry()">Retry configuration</button>
                </div>
            }
            @if (mutation.error()) {
                <p
                    class="notice"
                    role="alert"
                >
                    {{ mutation.error() }}
                </p>
            }
            @switch (section()) {
                @case ('roles') {
                    @if (roleEditor.loaded(); as role) {
                        <form
                            class="panel workflow-form"
                            [formGroup]="roleForm"
                            (ngSubmit)="saveRoles()"
                            novalidate
                        >
                            <h2>Manager report capabilities</h2>
                            <p>
                                Demo employee/manager/administrator roles remain
                                fixed. These flags control manager report
                                actions.
                            </p>
                            @if (roleEditor.feedback()) {
                                <p role="status">{{ roleEditor.feedback() }}</p>
                            }
                            <div class="field">
                                <label class="checkbox-row">
                                    <input
                                        type="checkbox"
                                        formControlName="managerCanCreateReports"
                                    />
                                    Allow managers to create saved reports
                                </label>
                            </div>
                            <div class="field">
                                <label class="checkbox-row">
                                    <input
                                        type="checkbox"
                                        formControlName="managerCanExportReports"
                                    />
                                    Allow managers to export CSV reports
                                </label>
                            </div>
                            <p>
                                Administrators retain both capabilities.
                                Existing owned reports remain readable.
                            </p>
                            <div class="form-actions">
                                <p>
                                    Version {{ role.version }} ·
                                    {{
                                        roleForm.dirty
                                            ? 'Unsaved changes'
                                            : 'Saved values'
                                    }}
                                </p>
                                <button
                                    type="submit"
                                    class="primary"
                                    [disabled]="mutation.busy()"
                                >
                                    {{
                                        mutation.busy()
                                            ? 'Saving roles…'
                                            : 'Save roles'
                                    }}
                                </button>
                            </div>
                            <button
                                type="button"
                                [disabled]="mutation.busy()"
                                (click)="reload()"
                            >
                                Reload saved configuration
                            </button>
                        </form>
                    }
                }
                @case ('categories') {
                    @if (categories.items().length) {
                        <section class="panel">
                            <div class="panel-header">
                                <h2>Request category availability</h2>
                            </div>
                            <div class="table-wrap">
                                <table>
                                    <caption class="sr-only">
                                        Request category configuration
                                    </caption>
                                    <thead>
                                        <tr>
                                            <th scope="col">Category</th>
                                            <th scope="col">Availability</th>
                                            <th scope="col">Version</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (
                                            category of categories.items();
                                            track category.id
                                        ) {
                                            <tr>
                                                <td>
                                                    <strong>
                                                        {{ category.label }}
                                                    </strong>
                                                    <small>
                                                        {{ category.id }}
                                                    </small>
                                                </td>
                                                <td>
                                                    {{
                                                        category.enabled
                                                            ? 'Submissions allowed'
                                                            : 'Submissions paused'
                                                    }}
                                                </td>
                                                <td>{{ category.version }}</td>
                                                <td>
                                                    <button
                                                        [attr.aria-label]="
                                                            'Edit ' +
                                                            category.id
                                                        "
                                                        [attr.aria-pressed]="
                                                            selectedCategory() ===
                                                            category.id
                                                        "
                                                        [disabled]="
                                                            mutation.busy()
                                                        "
                                                        (click)="
                                                            chooseCategory(
                                                                category.id
                                                            )
                                                        "
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    }
                    @if (
                        !categories.loading() &&
                        !categories.error() &&
                        !categories.items().length &&
                        !categoryEditor.loaded()
                    ) {
                        <section class="panel state">
                            <h2>No category configuration</h2>
                            <button (click)="retry()">
                                Restore categories
                            </button>
                        </section>
                    }
                    @if (categoryEditor.loaded(); as category) {
                        <form
                            class="panel workflow-form"
                            [formGroup]="categoryForm"
                            (ngSubmit)="saveCategory()"
                            novalidate
                        >
                            <h2>Edit {{ category.id | displayLabel }}</h2>
                            <p>
                                Category code stays fixed. Pausing applies to
                                future submitted requests; drafts and prior
                                decisions remain usable.
                            </p>
                            @if (categoryEditor.feedback()) {
                                <p role="status">
                                    {{ categoryEditor.feedback() }}
                                </p>
                            }
                            <div class="field">
                                <label for="category-label">
                                    Category label
                                </label>
                                <input
                                    id="category-label"
                                    formControlName="label"
                                    maxlength="60"
                                />
                                @if (
                                    categoryEditor.error(
                                        categoryForm.controls.label,
                                        'Category label'
                                    );
                                    as message
                                ) {
                                    <small class="field-error">
                                        {{ message }}
                                    </small>
                                }
                            </div>
                            <div class="field">
                                <label class="checkbox-row">
                                    <input
                                        type="checkbox"
                                        formControlName="enabled"
                                    />
                                    Allow new submissions in this category
                                </label>
                            </div>
                            <div class="form-actions">
                                <p>
                                    Version {{ category.version }} ·
                                    {{
                                        categoryForm.dirty
                                            ? 'Unsaved changes'
                                            : 'Saved values'
                                    }}
                                </p>
                                <button
                                    type="submit"
                                    class="primary"
                                    [disabled]="mutation.busy()"
                                >
                                    {{
                                        mutation.busy()
                                            ? 'Saving category…'
                                            : 'Save category'
                                    }}
                                </button>
                            </div>
                            <button
                                type="button"
                                [disabled]="mutation.busy()"
                                (click)="reload()"
                            >
                                Reload saved configuration
                            </button>
                        </form>
                    }
                }
                @case ('settings') {
                    @if (settingsEditor.loaded(); as settings) {
                        <form
                            class="panel workflow-form"
                            [formGroup]="settingsForm"
                            (ngSubmit)="saveSettings()"
                            novalidate
                        >
                            <h2>Organization defaults</h2>
                            @if (settingsEditor.feedback()) {
                                <p role="status">
                                    {{ settingsEditor.feedback() }}
                                </p>
                            }
                            <div class="field">
                                <label for="organization-name">
                                    Organization name
                                </label>
                                <input
                                    id="organization-name"
                                    formControlName="organizationName"
                                    maxlength="80"
                                />
                                @if (
                                    settingsEditor.error(
                                        settingsForm.controls.organizationName,
                                        'Organization name'
                                    );
                                    as message
                                ) {
                                    <small class="field-error">
                                        {{ message }}
                                    </small>
                                }
                            </div>
                            <div class="field">
                                <label for="default-dataset">
                                    Default report dataset
                                </label>
                                <select
                                    id="default-dataset"
                                    formControlName="defaultReportDataset"
                                >
                                    <option value="requests">Requests</option>
                                    <option value="assets">Assets</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <p>
                                    Version {{ settings.version }} ·
                                    {{
                                        settingsForm.dirty
                                            ? 'Unsaved changes'
                                            : 'Saved values'
                                    }}
                                </p>
                                <button
                                    type="submit"
                                    class="primary"
                                    [disabled]="mutation.busy()"
                                >
                                    {{
                                        mutation.busy()
                                            ? 'Saving settings…'
                                            : 'Save settings'
                                    }}
                                </button>
                            </div>
                            <button
                                type="button"
                                [disabled]="mutation.busy()"
                                (click)="reload()"
                            >
                                Reload saved configuration
                            </button>
                        </form>
                    }
                }
            }
        }
    `,
})
export class OrganizationEditor {
    readonly section = input.required<OrganizationSection>();
    private readonly session = inject(Session);
    private readonly injector = inject(Injector);
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly mutation = inject(WorkflowClient);
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly heading = computed(
        () =>
            ({
                roles: 'Role configuration',
                categories: 'Request categories',
                settings: 'Organization settings',
            })[this.section()],
    );
    readonly description = computed(
        () =>
            ({
                roles: 'Configure manager reporting actions.',
                categories:
                    'Maintain category labels and future submission availability.',
                settings: 'Set organization presentation and report defaults.',
            })[this.section()],
    );
    readonly roles = recordResource<RoleConfiguration>(() =>
        this.administrator() && this.section() === 'roles'
            ? '/api/config/roles'
            : undefined,
    );
    readonly settings = recordResource<OrganizationSettings>(() =>
        this.administrator() && this.section() === 'settings'
            ? '/api/config/settings'
            : undefined,
    );
    readonly categories = collectionResource<RequestCategoryConfig>(() =>
        this.administrator() && this.section() === 'categories'
            ? '/api/config/categories'
            : undefined,
    );
    readonly selectedCategory = signal<RequestCategory>('equipment');
    readonly roleForm = new FormGroup({
        managerCanCreateReports: new FormControl(true, { nonNullable: true }),
        managerCanExportReports: new FormControl(true, { nonNullable: true }),
    });
    readonly settingsForm = new FormGroup({
        organizationName: new FormControl('', {
            nonNullable: true,
            validators: [trimmedText(3, 80)],
        }),
        defaultReportDataset: new FormControl<ReportDataset>('requests', {
            nonNullable: true,
        }),
    });
    readonly categoryForm = new FormGroup({
        label: new FormControl('', {
            nonNullable: true,
            validators: [trimmedText(3, 60)],
        }),
        enabled: new FormControl(true, { nonNullable: true }),
    });
    readonly roleEditor = reactiveEditor(
        this.roleForm,
        this.roles.record,
        () => this.section(),
        (record) => ({ ...record }),
    );
    readonly settingsEditor = reactiveEditor(
        this.settingsForm,
        this.settings.record,
        () => this.section(),
        (record) => ({ ...record }),
    );
    readonly categoryEditor = reactiveEditor(
        this.categoryForm,
        () =>
            this.categories
                .items()
                .find((c) => c.id === this.selectedCategory()),
        () => `${this.section()}:${this.selectedCategory()}`,
        (record) => ({ ...record }),
    );
    readonly loading = computed(() =>
        this.section() === 'roles'
            ? this.roles.loading()
            : this.section() === 'settings'
              ? this.settings.loading()
              : this.categories.loading(),
    );
    readonly error = computed(() =>
        this.section() === 'roles'
            ? this.roles.error()
            : this.section() === 'settings'
              ? this.settings.error()
              : this.categories.error(),
    );
    readonly loaded = computed(() =>
        this.section() === 'roles'
            ? !!this.roleEditor.loaded()
            : this.section() === 'settings'
              ? !!this.settingsEditor.loaded()
              : !!this.categoryEditor.loaded(),
    );

    canLeave(): boolean {
        return this.section() === 'roles'
            ? this.roleEditor.canLeave()
            : this.section() === 'settings'
              ? this.settingsEditor.canLeave()
              : this.categoryEditor.canLeave();
    }

    chooseCategory(id: RequestCategory): void {
        if (id !== this.selectedCategory() && this.canLeave())
            this.selectedCategory.set(id);
    }

    retry(): void {
        if (this.section() === 'roles') this.roles.retry();
        else if (this.section() === 'settings') this.settings.retry();
        else this.categories.retry();
    }

    reload(): void {
        if (!this.canLeave()) return;
        if (this.section() === 'roles') this.roleEditor.clear();
        else if (this.section() === 'settings') this.settingsEditor.clear();
        else this.categoryEditor.clear();
        this.retry();
    }

    private focusInvalid(): void {
        afterNextRender(
            {
                write: () =>
                    this.element.nativeElement
                        .querySelector<HTMLElement>(
                            'input.ng-invalid,select.ng-invalid',
                        )
                        ?.focus(),
            },
            { injector: this.injector },
        );
    }

    saveRoles(): void {
        const current = this.roleEditor.loaded();
        if (!this.administrator() || !current || !this.roleEditor.valid())
            return;
        this.mutation.run<RoleConfiguration>(
            'PATCH',
            '/api/config/roles',
            { ...this.roleForm.getRawValue(), version: current.version },
            (record) => {
                this.roleEditor.load(record);
                this.roleEditor.feedback.set(
                    `Roles saved. Version ${record.version}.`,
                );
            },
        );
    }

    saveCategory(): void {
        const current = this.categoryEditor.loaded();
        if (!this.administrator() || !current) return;
        if (!this.categoryEditor.valid()) {
            this.focusInvalid();
            return;
        }
        this.mutation.run<RequestCategoryConfig>(
            'PATCH',
            `/api/config/categories/${current.id}`,
            { ...this.categoryForm.getRawValue(), version: current.version },
            (record) => {
                this.categoryEditor.load(record);
                this.categoryEditor.feedback.set(
                    `Category saved. Version ${record.version}.`,
                );
            },
        );
    }

    saveSettings(): void {
        const current = this.settingsEditor.loaded();
        if (!this.administrator() || !current) return;
        if (!this.settingsEditor.valid()) {
            this.focusInvalid();
            return;
        }
        this.mutation.run<OrganizationSettings>(
            'PATCH',
            '/api/config/settings',
            { ...this.settingsForm.getRawValue(), version: current.version },
            (record) => {
                this.settingsEditor.load(record);
                this.settingsEditor.feedback.set(
                    `Settings saved. Version ${record.version}.`,
                );
            },
        );
    }
}
