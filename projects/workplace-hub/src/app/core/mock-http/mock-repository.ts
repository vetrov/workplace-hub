import { Injectable, InjectionToken } from '@angular/core';
import {
    AssetSummary,
    canSeeAsset,
    canSeeRequest,
    DashboardSummary,
    DemoIdentity,
    ListKind,
    normalizeQuery,
    PageResult,
    RequestSummary,
    SeedData,
    WorkflowStore,
} from 'domain';
import { DEMO_IDENTITIES } from './seed-data';
import { WorkflowRepository } from './workflow-repository';

export interface Repository extends WorkflowStore {
    readonly data: SeedData;
    reset(): void;
    list(
        kind: ListKind,
        params: Record<string, string>,
        identity: DemoIdentity,
        contextKey: string,
    ): PageResult<RequestSummary | AssetSummary>;
    dashboard(identity: DemoIdentity, contextKey: string): DashboardSummary;
}

@Injectable({ providedIn: 'root' })
export class MockRepository extends WorkflowRepository implements Repository {
    constructor() {
        super();
    }

    list(
        kind: ListKind,
        params: Record<string, string>,
        identity: DemoIdentity,
        contextKey: string,
    ): PageResult<RequestSummary | AssetSummary> {
        const query = normalizeQuery(kind, params);
        const records: (RequestSummary | AssetSummary)[] =
            kind === 'requests'
                ? this.data.requests.filter((r) => canSeeRequest(r, identity))
                : this.data.assets.filter((a) =>
                      canSeeAsset(a, identity, this.data.people),
                  );
        const needle = query.q.toLowerCase();
        const filtered = records.filter((r) =>
            `${r.id} ${'title' in r ? r.title : r.name}`
                .toLowerCase()
                .includes(needle),
        );
        const [field, direction] = query.sort.split(':');
        const value = (r: RequestSummary | AssetSummary) =>
            field === 'createdAt' && 'createdAt' in r
                ? r.createdAt
                : field === 'status'
                  ? r.status
                  : 'title' in r
                    ? r.title
                    : r.name;
        filtered.sort(
            (a, b) =>
                (direction === 'desc' ? -1 : 1) *
                    value(a).localeCompare(value(b)) ||
                a.id.localeCompare(b.id),
        );
        const page = Math.min(
            query.page,
            Math.max(1, Math.ceil(filtered.length / query.pageSize)),
        );
        return {
            items: filtered.slice(
                (page - 1) * query.pageSize,
                page * query.pageSize,
            ),
            total: filtered.length,
            page,
            pageSize: query.pageSize,
            contextKey,
            queryKey: JSON.stringify(query),
        };
    }

    dashboard(identity: DemoIdentity, contextKey: string): DashboardSummary {
        const requests = this.data.requests.filter((r) =>
            canSeeRequest(r, identity),
        );
        const assets = this.data.assets.filter((a) =>
            canSeeAsset(a, identity, this.data.people),
        );
        return {
            requests: requests.length,
            pending: requests.filter((r) => r.status === 'submitted').length,
            assets: assets.length,
            available: assets.filter((a) => a.status === 'available').length,
            contextKey,
        };
    }
}

export const REPOSITORY = new InjectionToken<Repository>(
    'Workplace repository',
    {
        providedIn: 'root',
        factory: () => new MockRepository(),
    },
);

export const DEMO_SESSION = new InjectionToken<
    () => { identity: DemoIdentity; epoch: number }
>('Demo session reader', {
    providedIn: 'root',
    factory: () => () => ({ identity: DEMO_IDENTITIES[0], epoch: 0 }),
});

export const SCENARIO_CONTEXT = new InjectionToken<
    () => { mode: string; generation: number }
>('Scenario reader', {
    providedIn: 'root',
    factory: () => () => ({ mode: 'normal', generation: 0 }),
});
