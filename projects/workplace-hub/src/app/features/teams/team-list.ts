import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VersionedTeam, reportRole } from 'domain';
import { collectionResource } from '../../core/workflow-read';
import { Session } from '../../core/session/session';
import { personName } from '../../core/record-labels';

@Component({
    imports: [RouterLink],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">People & teams</p>
                <h1>Teams</h1>
                <p>Membership and work across your authorized teams.</p>
            </div>
        </div>
        @if (!allowed()) {
            <div class="panel state">
                <h2>Manager or administrator required</h2>
                <a routerLink="/people">View people directory</a>
            </div>
        }
        @if (reader.loading()) {
            <p role="status">Loading teams…</p>
        }
        @if (reader.error()) {
            <div
                class="notice"
                role="alert"
            >
                {{ reader.error() }}
                <button (click)="reader.retry()">Retry teams</button>
            </div>
        }
        @if (allowed() && !reader.loading() && !reader.error()) {
            <div class="supplier-grid">
                @for (team of reader.items(); track team.id) {
                    <section class="panel supplier-card">
                        <h2>
                            <a [routerLink]="['/teams', team.id]">
                                {{ team.name }}
                            </a>
                        </h2>
                        <p>{{ team.id }} · Version {{ team.version }}</p>
                        <p>
                            Manager:
                            <a [routerLink]="['/people', team.managerId]">
                                {{ personName(team.managerId) }}
                            </a>
                        </p>
                    </section>
                }
            </div>
            @if (!reader.items().length) {
                <section class="panel state">
                    <h2>No teams to show</h2>
                    <button (click)="reader.retry()">
                        Restore normal responses
                    </button>
                </section>
            }
        }
    `,
})
export class TeamList {
    private readonly session = inject(Session);
    readonly allowed = computed(() => reportRole(this.session.identity().role));
    readonly reader = collectionResource<VersionedTeam>(() =>
        this.allowed() ? '/api/teams' : undefined,
    );
    readonly personName = personName;
}
