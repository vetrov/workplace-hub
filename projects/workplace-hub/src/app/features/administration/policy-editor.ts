import {
    Component,
    computed,
    DestroyRef,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormField, submit } from '@angular/forms/signals';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { filter, firstValueFrom, takeUntil } from 'rxjs';
import { PurchasingPolicy, RecordResult } from 'domain';
import { CategoryPicker } from 'ui';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { DemoContext, responseError } from '../../core/mock-http/context';
import { recordResource } from '../../core/workflow-read';
import { createPolicyForm, emptyPolicyDraft } from './policy-form';

@Component({
    imports: [RouterLink, FormField, CategoryPicker],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Administration</p>
                <h1>Edit purchasing policy</h1>
                <p>
                    Limits affect future submissions; existing decisions are
                    unchanged.
                </p>
            </div>
            <a
                class="button"
                routerLink="/administration/policies"
            >
                Back to policies
            </a>
        </div>
        @if (!administrator()) {
            <section class="panel state">
                <h2>Administrator identity required</h2>
            </section>
        } @else {
            @if (reader.loading() && !loaded()) {
                <p role="status">Loading policy…</p>
            }
            @if (reader.error() && !loaded()) {
                <section
                    class="panel state"
                    role="alert"
                >
                    <p>{{ reader.error() }}</p>
                    <button (click)="reader.retry()">Retry policy</button>
                </section>
            }
            @if (loaded()) {
                <form
                    class="panel workflow-form"
                    (submit)="save($event)"
                    novalidate
                >
                    @if (attempted() && policyForm().errorSummary().length) {
                        <section
                            class="form-alert"
                            role="alert"
                        >
                            <h2>Check the policy fields</h2>
                            <ul>
                                @for (
                                    error of policyForm().errorSummary();
                                    track $index
                                ) {
                                    <li>{{ error.message }}</li>
                                }
                            </ul>
                        </section>
                    }
                    @if (feedback()) {
                        <p role="status">{{ feedback() }}</p>
                    }
                    <div class="field">
                        <label for="policy-name">Policy name</label>
                        <input
                            id="policy-name"
                            [formField]="policyForm.name"
                            aria-describedby="policy-name-error"
                        />
                        @if (policyForm.name().touched()) {
                            <small
                                id="policy-name-error"
                                class="field-error"
                            >
                                {{ policyForm.name().errors()[0]?.message }}
                            </small>
                        }
                    </div>
                    <div class="field">
                        <label for="policy-category">Request category</label>
                        <ui-category-picker
                            fieldId="policy-category"
                            label="Request category"
                            describedBy="policy-category-error"
                            [options]="categories"
                            [formField]="policyForm.category"
                        />
                        @if (policyForm.category().touched()) {
                            <small
                                id="policy-category-error"
                                class="field-error"
                            >
                                {{ policyForm.category().errors()[0]?.message }}
                            </small>
                        }
                    </div>
                    <div class="field">
                        <label for="policy-total">
                            Maximum estimated total (€)
                        </label>
                        <input
                            id="policy-total"
                            type="number"
                            step="0.01"
                            [formField]="policyForm.maximumTotal"
                            aria-describedby="policy-total-error"
                        />
                        @if (policyForm.maximumTotal().touched()) {
                            <small
                                id="policy-total-error"
                                class="field-error"
                            >
                                {{
                                    policyForm.maximumTotal().errors()[0]
                                        ?.message
                                }}
                            </small>
                        }
                    </div>
                    <div class="field">
                        <label for="policy-notes">Notes (optional)</label>
                        <textarea
                            id="policy-notes"
                            rows="3"
                            [formField]="policyForm.notes"
                        ></textarea>
                        @if (policyForm.notes().touched()) {
                            <small class="field-error">
                                {{ policyForm.notes().errors()[0]?.message }}
                            </small>
                        }
                    </div>
                    <div class="field">
                        <label class="checkbox-row">
                            <input
                                type="checkbox"
                                [formField]="policyForm.enabled"
                            />
                            Enable purchasing policy
                        </label>
                    </div>
                    <div class="form-actions">
                        <p>
                            Version {{ version() }} ·
                            {{
                                policyForm().dirty()
                                    ? 'Unsaved changes'
                                    : 'Saved values'
                            }}
                        </p>
                        <button
                            type="submit"
                            class="primary"
                            [disabled]="busy() || policyForm().submitting()"
                        >
                            {{ busy() ? 'Saving policy…' : 'Save policy' }}
                        </button>
                    </div>
                    <button
                        type="button"
                        [disabled]="busy()"
                        (click)="reload()"
                    >
                        Reload saved policy
                    </button>
                </form>
            }
        }
    `,
})
export class PolicyEditor {
    readonly id = input.required<string>();
    private readonly http = inject(HttpClient);
    private readonly session = inject(Session);
    private readonly scenario = inject(Scenario);
    private readonly context = inject(DemoContext);
    private readonly destroy = inject(DestroyRef);
    private readonly changes = toObservable(this.context.key);
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly model = signal(emptyPolicyDraft());
    readonly busy = signal(false);
    readonly loaded = signal(false);
    readonly attempted = signal(false);
    readonly feedback = signal('');
    readonly version = signal(0);
    readonly policyForm = createPolicyForm(this.model, this.busy);
    readonly categories = [
        { value: 'equipment', label: 'Equipment' },
        { value: 'software', label: 'Software' },
        { value: 'service', label: 'Service' },
    ];
    readonly reader = recordResource<PurchasingPolicy>(() =>
        this.administrator()
            ? `/api/policies/${encodeURIComponent(this.id())}`
            : undefined,
    );

    constructor() {
        effect(() => {
            this.session.epoch();
            this.scenario.resetVersion();
            this.id();
            untracked(() => this.clear());
        });
        effect(() => {
            const record = this.reader.record();
            if (
                record &&
                record.id === this.id() &&
                record.version !== this.version()
            )
                untracked(() => this.load(record));
        });
    }

    private clear(): void {
        this.loaded.set(false);
        this.version.set(0);
        this.feedback.set('');
        this.attempted.set(false);
        this.policyForm().reset(emptyPolicyDraft());
    }

    private load(record: PurchasingPolicy): void {
        this.version.set(record.version);
        this.policyForm().reset({
            name: record.name,
            category: record.category,
            maximumTotal: record.maximumTotal,
            enabled: record.enabled,
            notes: record.notes,
        });
        this.loaded.set(true);
    }

    canLeave(): boolean {
        return (
            !this.busy() &&
            !this.policyForm().submitting() &&
            (!this.policyForm().dirty() ||
                window.confirm('Discard unsaved policy changes?'))
        );
    }

    reload(): void {
        if (!this.canLeave()) return;
        this.clear();
        this.reader.retry();
    }

    async save(event: Event): Promise<void> {
        event.preventDefault();
        if (!this.administrator() || !this.loaded() || this.busy()) return;
        // Root submission errors clear when the model reference changes. Keep field values and dirty state for a retry.
        if (this.policyForm().getError('save'))
            this.model.update((value) => ({ ...value }));
        this.attempted.set(true);
        this.feedback.set('');
        await submit(this.policyForm, {
            ignoreValidators: 'none',
            onInvalid: (field) =>
                field().errorSummary()[0]?.fieldTree().focusBoundControl(),
            action: async (field) => {
                const key = this.context.key();
                const body = structuredClone({
                    ...field().value(),
                    version: this.version(),
                });
                this.busy.set(true);
                try {
                    const result = await firstValueFrom(
                        this.http
                            .patch<RecordResult<PurchasingPolicy>>(
                                `/api/policies/${encodeURIComponent(this.id())}`,
                                body,
                            )
                            .pipe(
                                takeUntil(
                                    this.changes.pipe(
                                        filter((value) => value !== key),
                                    ),
                                ),
                                takeUntilDestroyed(this.destroy),
                            ),
                    );
                    if (key !== this.context.key() || result.contextKey !== key)
                        return undefined;
                    this.load(result.record);
                    this.feedback.set(
                        `Policy saved. Version ${result.record.version}.`,
                    );
                    this.scenario.refresh();
                    return undefined;
                } catch (error) {
                    return key !== this.context.key()
                        ? undefined
                        : { kind: 'save', message: responseError(error) };
                } finally {
                    this.busy.set(false);
                }
            },
        });
    }
}
