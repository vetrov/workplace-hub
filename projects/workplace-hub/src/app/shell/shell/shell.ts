import {
    AfterRenderRef,
    afterNextRender,
    Component,
    computed,
    ElementRef,
    inject,
    Injector,
    viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
    Router,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NavigationEnd,
    NavigationStart,
    NavigationCancel,
    NavigationError,
    NavigationSkipped,
} from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { Organization } from '../../core/organization';
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
    readonly organization = inject(Organization);

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
                    reports: 'Reports',
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
        { path: '/reports', label: 'Reports', icon: '▥' },
        { path: '/suppliers', label: 'Suppliers', icon: '◇' },
        {
            path: '/administration/policies',
            label: 'Purchasing policies',
            icon: '⚑',
        },
        { path: '/administration/roles', label: 'Roles', icon: '♙' },
        { path: '/administration/categories', label: 'Categories', icon: '⊞' },
        {
            path: '/administration/settings',
            label: 'Organization settings',
            icon: '⚙',
        },
        { path: '/preferences', label: 'Preferences', icon: '⚙' },
    ];

    readonly navigating = computed(() => !!this.router.currentNavigation());

    private readonly injector = inject(Injector);
    private readonly document = inject(DOCUMENT);
    private readonly content =
        viewChild<ElementRef<HTMLElement>>('routeContent');
    private pendingFocus?: AfterRenderRef;
    private previousPath?: string;
    private navigationId = 0;
    private startingFocus: Element | null = null;

    constructor() {
        this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.cancelFocus();
                this.navigationId = event.id;
                this.startingFocus = this.document.activeElement;
            } else if (
                event instanceof NavigationCancel ||
                event instanceof NavigationError ||
                event instanceof NavigationSkipped
            ) {
                this.cancelFocus();
            } else if (event instanceof NavigationEnd) {
                const path = event.urlAfterRedirects.split(/[?#]/, 1)[0];
                const changed =
                    this.previousPath !== undefined &&
                    this.previousPath !== path;
                this.previousPath = path;
                if (!changed) return;
                const navigationId = event.id,
                    startingFocus = this.startingFocus;
                this.pendingFocus = afterNextRender(
                    {
                        earlyRead: () => {
                            const content = this.content()?.nativeElement;
                            if (
                                !content ||
                                this.navigationId !== navigationId ||
                                !content.isConnected
                            )
                                return undefined;
                            const active = this.document.activeElement;
                            if (
                                active &&
                                active !== startingFocus &&
                                content.contains(active) &&
                                active.matches(
                                    'input,select,textarea,button,a,[tabindex]',
                                )
                            )
                                return undefined;
                            return (
                                content.querySelector<HTMLElement>('h1') ??
                                content
                            );
                        },
                        write: (target) => {
                            if (!target || !target.isConnected) return;
                            if (!target.hasAttribute('tabindex'))
                                target.setAttribute('tabindex', '-1');
                            target.focus({ preventScroll: true });
                        },
                    },
                    { injector: this.injector },
                );
            }
        });
    }

    private cancelFocus(): void {
        this.pendingFocus?.destroy();
        this.pendingFocus = undefined;
    }
}
