import { Component, inject } from '@angular/core';
import { StatusBadge } from 'ui';
import { LIST_KIND, ListQueryState } from '../../core/list-query';
import { INITIAL_DATA } from '../../core/mock-http/seed-data';
import { AssetListService } from './asset-list.service';
import { Scenario } from '../../core/scenarios/scenario';

@Component({ imports: [StatusBadge], providers: [{ provide: LIST_KIND, useValue: 'assets' }, ListQueryState, AssetListService], templateUrl: './assets.html' })
export class Assets {
  readonly list = inject(AssetListService);
  readonly query = inject(ListQueryState);
  readonly Math = Math;
  private readonly scenario = inject(Scenario);
  retry(): void { this.scenario.retry(); this.list.retry(); }
  personName(id: string | null): string { return id ? INITIAL_DATA.people.find(p => p.id === id)?.name ?? 'Unknown person' : 'Unassigned'; }
  supplierName(id: string): string { return INITIAL_DATA.suppliers.find(s => s.id === id)?.name ?? 'Unknown supplier'; }
  setSize(value: string): void { this.query.update({ pageSize: Number(value) as 25 | 50 | 100, page: 1 }); }
}
