import { Injectable, InjectionToken } from '@angular/core';
import { AssetSummary, DashboardSummary, DemoIdentity, ListKind, PageResult, RequestSummary, SeedData } from 'domain';
import { createSeedData, DEMO_IDENTITIES } from './seed-data';

export interface Repository {
  readonly data: SeedData;
  reset(): void;
  list(kind: ListKind, params: Record<string, string>, identity: DemoIdentity, contextKey: string): PageResult<RequestSummary | AssetSummary>;
  dashboard(identity: DemoIdentity, contextKey: string): DashboardSummary;
}

@Injectable({ providedIn: 'root' })
export class MockRepository implements Repository {
  data = createSeedData();

  reset(): void { this.data = createSeedData(); }

  list(kind: ListKind, _params: Record<string, string>, _identity: DemoIdentity, contextKey: string): PageResult<RequestSummary | AssetSummary> {
    const records = kind === 'requests' ? this.data.requests : this.data.assets;
    return { items: records.slice(0, 25), total: records.length, page: 1, pageSize: 25, contextKey };
  }

  dashboard(_identity: DemoIdentity, contextKey: string): DashboardSummary {
    return { requests: this.data.requests.length, pending: this.data.requests.filter(r => r.status === 'submitted').length,
      assets: this.data.assets.length, available: this.data.assets.filter(a => a.status === 'available').length, contextKey };
  }
}

export const REPOSITORY = new InjectionToken<Repository>('Workplace repository', { providedIn: 'root', factory: () => new MockRepository() });
export const DEMO_SESSION = new InjectionToken<() => { identity: DemoIdentity; epoch: number }>('Demo session reader', {
  providedIn: 'root', factory: () => () => ({ identity: DEMO_IDENTITIES[0], epoch: 0 }),
});
export const SCENARIO_CONTEXT = new InjectionToken<() => { mode: string; generation: number }>('Scenario reader', {
  providedIn: 'root', factory: () => () => ({ mode: 'normal', generation: 0 }),
});
