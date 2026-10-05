import {
    afterNextRender,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    inject,
    Injector,
    input,
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
import { RouterLink } from '@angular/router';
import { Person, TeamView, VersionedTeam, reportRole } from 'domain';
import { EmployeePicker, StatusBadge } from 'ui';
import { collectionResource, recordResource } from '../../core/workflow-read';
import { WorkflowClient } from '../../core/workflow-client';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { DEMO_IDENTITIES } from '../../core/mock-http/seed-data';

@Component({
    imports: [RouterLink, ReactiveFormsModule, EmployeePicker, StatusBadge],
    providers: [WorkflowClient],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">People & teams</p>
                <h1>Team membership</h1>
                <p>
                    Historical requests retain their original team; inventory
                    follows current membership.
                </p>
            </div>
            <a
                class="button"
                routerLink="/teams"
            >
                Back to teams
            </a>
        </div>
        @if (!allowed()) {
            <section class="panel state">
                <h2>This identity cannot inspect this team</h2>
                <a routerLink="/people">View people</a>
            </section>
        }
        @if (reader.loading()) {
            <p role="status">Loading team…</p>
        }
        @if (reader.error()) {
            <div
                class="notice"
                role="alert"
            >
                {{ reader.error() }}
                <button (click)="reader.retry()">Retry team</button>
            </div>
        }
        @if (view(); as view) {
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>{{ view.team.name }}</h2>
                        <p>
                            {{ view.members.length }} members ·
                            {{ view.requests.length }} visible historical
                            requests · {{ view.assets.length }} assigned assets
                        </p>
                    </div>
                    <span>Version {{ view.team.version }}</span>
                </div>
                <div class="table-wrap">
                    <table>
                        <caption class="sr-only">
                            Current team membership
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">Colleague</th>
                                <th scope="col">Email</th>
                                <th scope="col">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (member of view.members; track member.id) {
                                <tr>
                                    <td>
                                        <a
                                            [routerLink]="[
                                                '/people',
                                                member.id,
                                            ]"
                                        >
                                            {{ member.name }}
                                        </a>
                                    </td>
                                    <td>{{ member.email }}</td>
                                    <td>
                                        {{
                                            member.id === view.team.managerId
                                                ? 'Team manager'
                                                : 'Member'
                                        }}
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </section>
            @if (administrator()) {
                <form
                    class="panel workflow-form"
                    [formGroup]="form"
                    (ngSubmit)="transfer()"
                    novalidate
                >
                    <h2>Transfer a colleague into this team</h2>
                    <p>
                        Team managers and fixed demo identities stay in their
                        original teams.
                    </p>
                    @if (people.loading()) {
                        <p role="status">Loading eligible colleagues…</p>
                    }
                    @if (people.error()) {
                        <p role="alert">
                            {{ people.error() }}
                            <button
                                type="button"
                                (click)="people.retry()"
                            >
                                Retry colleagues
                            </button>
                        </p>
                    }
                    @if (teamsError()) {
                        <p role="alert">
                            {{ teamsError() }}
                            <button
                                type="button"
                                (click)="retryTeams()"
                            >
                                Retry team options
                            </button>
                        </p>
                    }
                    @if (mutation.error()) {
                        <p role="alert">{{ mutation.error() }}</p>
                    }
                    @if (feedback()) {
                        <p role="status">{{ feedback() }}</p>
                    }
                    <div class="field">
                        <label for="transfer-person">Colleague</label>
                        <ui-employee-picker
                            fieldId="transfer-person"
                            describedBy="transfer-error"
                            [options]="options()"
                            formControlName="personId"
                        />
                        @if (
                            form.controls.personId.touched &&
                            form.controls.personId.invalid
                        ) {
                            <small
                                class="field-error"
                                id="transfer-error"
                            >
                                Choose an eligible colleague.
                            </small>
                        }
                    </div>
                    <div class="form-actions">
                        <button
                            type="submit"
                            class="primary"
                            [disabled]="
                                mutation.busy() ||
                                people.loading() ||
                                !options().length
                            "
                        >
                            {{
                                mutation.busy()
                                    ? 'Transferring…'
                                    : 'Transfer colleague'
                            }}
                        </button>
                    </div>
                </form>
            }
            <section class="panel">
                <div class="panel-header"><h2>Team work</h2></div>
                <div class="workflow-form">
                    @for (
                        request of view.requests.slice(0, 10);
                        track request.id
                    ) {
                        <p>
                            <a [routerLink]="['/requests', request.id]">
                                {{ request.id }} · {{ request.title }}
                            </a>
                            <ui-status [value]="request.status" />
                        </p>
                    }
                    @if (!view.requests.length) {
                        <p>No requests visible for this team.</p>
                    }
                </div>
            </section>
        }
    `,
})
export class TeamDetail {
    readonly id = input.required<string>();
    private readonly session = inject(Session);
    private readonly scenario = inject(Scenario);
    private readonly injector = inject(Injector);
    readonly mutation = inject(WorkflowClient);
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly allowed = computed(() => {
        const actor = this.session.identity();
        return (
            reportRole(actor.role) &&
            (actor.role === 'administrator' || actor.teamId === this.id())
        );
    });
    readonly reader = recordResource<TeamView>(() =>
        this.allowed()
            ? `/api/teams/${encodeURIComponent(this.id())}`
            : undefined,
    );
    readonly people = collectionResource<Person>(() =>
        this.administrator() ? '/api/people-options' : undefined,
    );
    private readonly teams = collectionResource<VersionedTeam>(() =>
        this.administrator() ? '/api/teams' : undefined,
    );

    private readonly scope = computed(
        () =>
            `${this.session.epoch()}:${this.scenario.resetVersion()}:${this.id()}`,
    );
    private readonly snapshot = signal<
        | {
              scope: string;
              view: TeamView;
              people: readonly Person[];
              teams: readonly VersionedTeam[];
          }
        | undefined
    >(undefined);
    readonly view = computed(() =>
        this.allowed() && this.snapshot()?.scope === this.scope()
            ? this.snapshot()?.view
            : undefined,
    );
    private readonly retainedPeople = computed(() =>
        this.snapshot()?.scope === this.scope() ? this.snapshot()!.people : [],
    );
    readonly options = computed(() =>
        this.administrator() &&
        this.snapshot()?.scope === this.scope() &&
        !!this.snapshot()?.teams.length
            ? this.retainedPeople()
                  .filter(
                      (p) =>
                          p.teamId !== this.id() &&
                          !DEMO_IDENTITIES.some((a) => a.personId === p.id) &&
                          !this.snapshot()!.teams.some(
                              (t) => t.managerId === p.id,
                          ),
                  )
                  .map((p) => ({
                      value: p.id,
                      label: `${p.name} · ${p.teamId}`,
                  }))
            : [],
    );

    readonly form = new FormGroup({
        personId: new FormControl<string | null>(null, Validators.required),
    });
    readonly feedback = signal('');
    private readonly picker = viewChild(EmployeePicker);

    constructor() {
        effect(() => {
            const view = this.reader.record(),
                people = this.people.items(),
                teams = this.teams.items(),
                scope = this.scope();
            untracked(() => {
                const previous =
                    this.snapshot()?.scope === scope
                        ? this.snapshot()
                        : undefined;
                if (view && view.team.id === this.id())
                    this.snapshot.set({
                        scope,
                        view,
                        people: people.length
                            ? people
                            : (previous?.people ?? []),
                        teams: teams.length ? teams : (previous?.teams ?? []),
                    });
                else if (previous && (people.length || teams.length))
                    this.snapshot.set({
                        ...previous,
                        people: people.length ? people : previous.people,
                        teams: teams.length ? teams : previous.teams,
                    });
            });
        });
        const cdr = inject(ChangeDetectorRef);
        this.form.events
            .pipe(takeUntilDestroyed())
            .subscribe(() => cdr.markForCheck());
        effect(() => {
            this.session.epoch();
            this.scenario.resetVersion();
            this.id();
            this.form.reset();
            this.feedback.set('');
        });
        effect(() => {
            if (this.mutation.busy()) this.form.disable({ emitEvent: false });
            else this.form.enable({ emitEvent: false });
        });
    }

    readonly teamsError = this.teams.error;

    retryTeams(): void {
        this.teams.retry();
    }

    canLeave(): boolean {
        return (
            !this.mutation.busy() &&
            (!this.form.dirty ||
                window.confirm('Discard the unsaved team transfer?'))
        );
    }

    transfer(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            afterNextRender(
                { write: () => this.picker()?.focus() },
                { injector: this.injector },
            );
            return;
        }
        const view = this.view(),
            person = this.retainedPeople().find(
                (p) => p.id === this.form.controls.personId.value,
            );
        if (!view || !person || !this.administrator()) return;
        this.mutation.run<TeamView>(
            'POST',
            `/api/teams/${view.team.id}/transfer`,
            {
                personId: person.id,
                fromTeamId: person.teamId,
                version: view.team.version,
            },
            () => {
                this.form.reset();
                this.feedback.set(
                    `${person.name} transferred. Membership saved.`,
                );
            },
        );
    }
}
