import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({ selector: 'app-shell', imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './shell.html' })
export class Shell {
  private readonly router = inject(Router);
  readonly path = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url), startWith(this.router.url)), { initialValue: '/' });
  readonly section = computed(() => ({ dashboard: 'Overview', requests: 'Requests', assets: 'Assets', preferences: 'Preferences' })[this.path().split('/')[1]?.split('?')[0] as 'dashboard'] ?? 'Workspace');
  readonly links = [
    { path: '/dashboard', label: 'Overview', icon: '◫' }, { path: '/requests', label: 'Requests', icon: '≡' },
    { path: '/assets', label: 'Assets', icon: '▣' }, { path: '/preferences', label: 'Preferences', icon: '⚙' },
  ];
  readonly planned = ['Approvals', 'Suppliers', 'People & teams', 'Reports', 'Administration'];
}
