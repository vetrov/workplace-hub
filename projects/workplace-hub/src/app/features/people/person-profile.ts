import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PersonView } from 'domain';
import { StatusBadge } from 'ui';
import { recordResource } from '../../core/workflow-read';
import { Session } from '../../core/session/session';

@Component({
    imports: [RouterLink, StatusBadge],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">People</p>
                <h1>Colleague profile</h1>
                <p>Work links follow your current demo permissions.</p>
            </div>
            <a
                class="button"
                routerLink="/people"
            >
                Back to people
            </a>
        </div>
        @if (reader.loading()) {
            <p role="status">Loading profile…</p>
        }
        @if (reader.error()) {
            <div
                class="notice"
                role="alert"
            >
                {{ reader.error() }}
                <button (click)="reader.retry()">Retry profile</button>
            </div>
        }
        @if (reader.record(); as view) {
            <section class="panel workflow-form">
                <h2>{{ view.person.name }}</h2>
                <dl class="facts">
                    <div>
                        <dt>Email</dt>
                        <dd>{{ view.person.email }}</dd>
                    </div>
                    <div>
                        <dt>Person ID</dt>
                        <dd>{{ view.person.id }}</dd>
                    </div>
                    <div>
                        <dt>Team</dt>
                        <dd>
                            @if (teamVisible(view.team.id)) {
                                <a [routerLink]="['/teams', view.team.id]">
                                    {{ view.team.name }}
                                </a>
                            } @else {
                                {{ view.team.name }}
                            }
                        </dd>
                    </div>
                </dl>
            </section>
            <div class="dashboard-columns">
                <section class="panel">
                    <div class="panel-header">
                        <h2>Visible requests ({{ view.requests.length }})</h2>
                    </div>
                    @for (
                        request of view.requests.slice(0, 25);
                        track request.id
                    ) {
                        <div class="asset-preview">
                            <div>
                                <a [routerLink]="['/requests', request.id]">
                                    {{ request.title }}
                                </a>
                                <small>{{ request.id }}</small>
                            </div>
                            <ui-status [value]="request.status" />
                        </div>
                    }
                    @if (!view.requests.length) {
                        <p class="state">
                            No requests visible to this identity.
                        </p>
                    }
                </section>
                <section class="panel">
                    <div class="panel-header">
                        <h2>Visible equipment ({{ view.assets.length }})</h2>
                    </div>
                    @for (asset of view.assets.slice(0, 25); track asset.id) {
                        <div class="asset-preview">
                            <div>
                                <a [routerLink]="['/assets', asset.id]">
                                    {{ asset.name }}
                                </a>
                                <small>{{ asset.id }}</small>
                            </div>
                            <ui-status [value]="asset.status" />
                        </div>
                    }
                    @if (!view.assets.length) {
                        <p class="state">
                            No assigned equipment visible to this identity.
                        </p>
                    }
                </section>
            </div>
        }
    `,
})
export class PersonProfile {
    readonly id = input.required<string>();
    private readonly session = inject(Session);
    readonly reader = recordResource<PersonView>(
        () => `/api/people/${encodeURIComponent(this.id())}`,
    );

    teamVisible(id: string): boolean {
        const actor = this.session.identity();
        return (
            actor.role === 'administrator' ||
            (actor.role === 'manager' && id === actor.teamId)
        );
    }
}
