import { Component, computed, inject } from '@angular/core';
import {
    Router,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NavigationEnd,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { ScenarioMode } from 'domain';

@Component({
    selector: 'app-shell',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './shell.html',
})
export class Shell {
    readonly session = inject(Session);
    readonly scenario = inject(Scenario);

    setScenario(mode: string): void {
        this.scenario.select(mode as ScenarioMode);
    }

    private readonly router = inject(Router);

    readonly path = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => this.router.url),
            startWith(this.router.url),
        ),
        { initialValue: '/' },
    );

    readonly section = computed(
        () =>
            (
                ({
                    dashboard: 'Overview',
                    requests: 'Requests',
                    assets: 'Assets',
                    approvals: 'Approvals',
                    preferences: 'Preferences',
                    suppliers: 'Suppliers',
                    people: 'People',
                    teams: 'Teams',
                    administration: 'Administration',
                }) as Record<string, string>
            )[this.path().split('/')[1]?.split('?')[0]] ?? 'Workspace',
    );

    readonly links = [
        { path: '/dashboard', label: 'Overview', icon: '◫' },
        { path: '/requests', label: 'Requests', icon: '≡' },
        { path: '/approvals', label: 'Approvals', icon: '✓' },
        { path: '/assets', label: 'Assets', icon: '▣' },
        { path: '/people', label: 'People', icon: '◎' },
        { path: '/teams', label: 'Teams', icon: '◈' },
        { path: '/suppliers', label: 'Suppliers', icon: '◇' },
        {
            path: '/administration/policies',
            label: 'Purchasing policies',
            icon: '⚑',
        },
        { path: '/preferences', label: 'Preferences', icon: '⚙' },
    ];

    readonly planned = ['Reports', 'More administration'];
}
