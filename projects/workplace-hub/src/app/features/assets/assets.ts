import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Session } from '../../core/session/session';
import { StatusBadge } from 'ui';
import { LIST_KIND, ListQueryState } from '../../core/list-query';
import { INITIAL_DATA } from '../../core/mock-http/seed-data';
import { AssetListService } from './asset-list.service';
import { Scenario } from '../../core/scenarios/scenario';
import { Supplier } from 'domain';
import { collectionResource } from '../../core/workflow-read';

@Component({
    imports: [RouterLink, StatusBadge],
    providers: [
        { provide: LIST_KIND, useValue: 'assets' },
        ListQueryState,
        AssetListService,
    ],
    templateUrl: './assets.html',
})
export class Assets {
    readonly session = inject(Session);
    readonly list = inject(AssetListService);
    readonly query = inject(ListQueryState);
    readonly Math = Math;
    private readonly scenario = inject(Scenario);
    private readonly suppliers = collectionResource<Supplier>(
        () => '/api/supplier-options',
    );

    retry(): void {
        this.scenario.retry();
        this.list.retry();
    }

    personName(id: string | null): string {
        return id
            ? (INITIAL_DATA.people.find((p) => p.id === id)?.name ??
                  'Unknown person')
            : 'Unassigned';
    }

    supplierName(id: string): string {
        return this.suppliers.items().find((s) => s.id === id)?.name ?? id;
    }

    pageTo(page: number): void {
        const result = this.list.state().page;
        if (
            result &&
            page >= 1 &&
            page <= Math.max(1, Math.ceil(result.total / result.pageSize))
        )
            this.query.update({ page });
    }

    setSize(value: string): void {
        this.query.update({
            pageSize: Number(value) as 25 | 50 | 100,
            page: 1,
        });
    }
}
