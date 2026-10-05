import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/workflow-guards';
import { reportResolver } from './report-resolver';

export const REPORT_ROUTES: Routes = [
    {
        path: '',
        title: 'Saved reports · Workplace Hub',
        loadComponent: () => import('./report-list').then((m) => m.ReportList),
    },
    {
        path: 'new',
        title: 'Configure report · Workplace Hub',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
            import('./report-create').then((m) => m.ReportCreate),
    },
    {
        path: ':id',
        title: 'Report results · Workplace Hub',
        resolve: { resolved: reportResolver },
        loadComponent: () =>
            import('./report-detail').then((m) => m.ReportDetail),
    },
];
