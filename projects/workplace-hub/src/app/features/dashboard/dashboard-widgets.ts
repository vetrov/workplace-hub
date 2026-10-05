import {
    Component,
    computed,
    inject,
    input,
    InputSignal,
    Type,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardSummary } from 'domain';
import { WidgetSurface } from 'ui';
import { Session } from '../../core/session/session';

@Component({
    imports: [RouterLink],
    hostDirectives: [
        { directive: WidgetSurface, inputs: ['surfaceLabel:widgetLabel'] },
    ],
    template: `
        <h2>Pending work</h2>
        <p>
            <strong>{{ summary().pending }}</strong>
            requests awaiting review across your visible records.
        </p>
        <a [routerLink]="manager() ? '/approvals' : '/requests'">
            {{ manager() ? 'Review approvals' : 'View requests' }} →
        </a>
    `,
})
export class PendingWorkWidget {
    readonly summary = input.required<DashboardSummary>();
    private readonly session = inject(Session);
    readonly manager = computed(
        () => this.session.identity().role === 'manager',
    );
}

@Component({
    imports: [RouterLink],
    hostDirectives: [
        { directive: WidgetSurface, inputs: ['surfaceLabel:widgetLabel'] },
    ],
    template: `
        <h2>Inventory availability</h2>
        <p>
            <strong>{{ summary().available }}</strong>
            available of {{ summary().assets }} visible assets.
        </p>
        <a routerLink="/assets">Explore inventory →</a>
    `,
})
export class InventoryWidget {
    readonly summary = input.required<DashboardSummary>();
}

interface DashboardWidget {
    readonly id: 'work' | 'inventory';
    readonly label: string;
    readonly component: Type<{
        readonly summary: InputSignal<DashboardSummary>;
    }>;
}

export const DASHBOARD_WIDGETS: readonly DashboardWidget[] = [
    { id: 'work', label: 'Pending work', component: PendingWorkWidget },
    {
        id: 'inventory',
        label: 'Inventory availability',
        component: InventoryWidget,
    },
];
