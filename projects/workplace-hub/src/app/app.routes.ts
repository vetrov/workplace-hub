import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', title: 'Overview · Workplace Hub', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'requests', title: 'Requests · Workplace Hub', loadComponent: () => import('./features/requests/requests').then(m => m.Requests) },
  { path: 'assets', title: 'Assets · Workplace Hub', loadComponent: () => import('./features/assets/assets').then(m => m.Assets) },
  { path: 'preferences', title: 'Preferences · Workplace Hub', loadComponent: () => import('./features/preferences/preferences-page').then(m => m.PreferencesPage) },
];
