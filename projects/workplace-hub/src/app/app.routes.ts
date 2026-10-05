import { Routes } from '@angular/router';
import {
    requestChangesGuard,
    roleGuard,
    unsavedChangesGuard,
} from './core/workflow-guards';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    {
        path: 'dashboard',
        title: 'Overview · Workplace Hub',
        loadComponent: () =>
            import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    },
    {
        path: 'requests/new',
        title: 'New request · Workplace Hub',
        canActivate: [roleGuard('employee')],
        canDeactivate: [requestChangesGuard],
        loadComponent: () =>
            import('./features/requests/request-wizard').then(
                (m) => m.RequestWizard,
            ),
    },
    {
        path: 'requests/:id/edit',
        title: 'Edit request · Workplace Hub',
        canActivate: [roleGuard('employee')],
        canDeactivate: [requestChangesGuard],
        loadComponent: () =>
            import('./features/requests/request-wizard').then(
                (m) => m.RequestWizard,
            ),
    },
    {
        path: 'requests/:id',
        title: 'Request details · Workplace Hub',
        loadComponent: () =>
            import('./features/requests/request-detail').then(
                (m) => m.RequestDetailPage,
            ),
    },
    {
        path: 'requests',
        title: 'Requests · Workplace Hub',
        loadComponent: () =>
            import('./features/requests/requests').then((m) => m.Requests),
    },
    {
        path: 'approvals/:id',
        title: 'Review request · Workplace Hub',
        canActivate: [roleGuard('manager')],
        loadComponent: () =>
            import('./features/approvals/approvals').then((m) => m.Approvals),
    },
    {
        path: 'approvals',
        title: 'Approvals · Workplace Hub',
        canActivate: [roleGuard('manager')],
        loadComponent: () =>
            import('./features/approvals/approvals').then((m) => m.Approvals),
    },
    {
        path: 'assets/new',
        title: 'New asset · Workplace Hub',
        canActivate: [roleGuard('administrator')],
        loadComponent: () =>
            import('./features/assets/asset-create').then((m) => m.AssetCreate),
    },
    {
        path: 'assets/:id/assign',
        title: 'Assign asset · Workplace Hub',
        data: { assignment: true },
        canActivate: [roleGuard('administrator')],
        loadComponent: () =>
            import('./features/assets/asset-detail').then(
                (m) => m.AssetDetailPage,
            ),
    },
    {
        path: 'assets/:id',
        title: 'Asset details · Workplace Hub',
        loadComponent: () =>
            import('./features/assets/asset-detail').then(
                (m) => m.AssetDetailPage,
            ),
    },
    {
        path: 'assets',
        title: 'Assets · Workplace Hub',
        loadComponent: () =>
            import('./features/assets/assets').then((m) => m.Assets),
    },
    {
        path: 'people',
        title: 'People · Workplace Hub',
        loadComponent: () =>
            import('./features/people/people-directory').then(
                (m) => m.PeopleDirectory,
            ),
    },
    {
        path: 'people/:id',
        title: 'Colleague · Workplace Hub',
        loadComponent: () =>
            import('./features/people/person-profile').then(
                (m) => m.PersonProfile,
            ),
    },
    {
        path: 'teams',
        title: 'Teams · Workplace Hub',
        canActivate: [roleGuard('manager', 'administrator')],
        loadComponent: () =>
            import('./features/teams/team-list').then((m) => m.TeamList),
    },
    {
        path: 'teams/:id',
        title: 'Team membership · Workplace Hub',
        canActivate: [roleGuard('manager', 'administrator')],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
            import('./features/teams/team-detail').then((m) => m.TeamDetail),
    },
    {
        path: 'suppliers',
        canActivate: [roleGuard('administrator')],
        loadChildren: () =>
            import('./features/suppliers/suppliers.module').then(
                (m) => m.SuppliersModule,
            ),
    },
    {
        path: 'administration/policies/:id/edit',
        title: 'Edit policy · Workplace Hub',
        canActivate: [roleGuard('administrator')],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
            import('./features/administration/policy-editor').then(
                (m) => m.PolicyEditor,
            ),
    },
    {
        path: 'administration/policies',
        title: 'Purchasing policies · Workplace Hub',
        canActivate: [roleGuard('administrator')],
        loadComponent: () =>
            import('./features/administration/policy-list').then(
                (m) => m.PolicyList,
            ),
    },
    {
        path: 'preferences',
        title: 'Preferences · Workplace Hub',
        loadComponent: () =>
            import('./features/preferences/preferences-page').then(
                (m) => m.PreferencesPage,
            ),
    },
    {
        path: 'access-denied',
        title: 'Access denied · Workplace Hub',
        loadComponent: () =>
            import('./shell/access-denied/access-denied').then(
                (m) => m.AccessDenied,
            ),
    },
    {
        path: '**',
        title: 'Page not found · Workplace Hub',
        loadComponent: () =>
            import('./shell/not-found/not-found').then((m) => m.NotFound),
    },
];
