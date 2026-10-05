import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Overview · Workplace Hub',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'requests',
    title: 'Requests · Workplace Hub',
    loadComponent: () => import('./features/requests/requests').then((m) => m.Requests),
  },
  {
    path: 'assets',
    title: 'Assets · Workplace Hub',
    loadComponent: () => import('./features/assets/assets').then((m) => m.Assets),
  },
  {
    path: 'preferences',
    title: 'Preferences · Workplace Hub',
    loadComponent: () =>
      import('./features/preferences/preferences-page').then((m) => m.PreferencesPage),
  },
  {
    path: 'access-denied',
    title: 'Access denied · Workplace Hub',
    loadComponent: () => import('./shell/access-denied/access-denied').then((m) => m.AccessDenied),
  },
  {
    path: '**',
    title: 'Page not found · Workplace Hub',
    loadComponent: () => import('./shell/not-found/not-found').then((m) => m.NotFound),
  },
];
