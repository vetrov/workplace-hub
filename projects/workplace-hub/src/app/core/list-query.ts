import {
    computed,
    effect,
    inject,
    Injectable,
    InjectionToken,
    untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ASSET_SORTS,
    ListKind,
    ListQuery,
    normalizeQuery,
    REQUEST_SORTS,
} from 'domain';
import { debounceTime, Subject } from 'rxjs';
import { Scenario } from './scenarios/scenario';

export const LIST_KIND = new InjectionToken<ListKind>('List kind');

@Injectable()
export class ListQueryState {
    readonly kind = inject(LIST_KIND);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly parameters = toSignal(this.route.queryParamMap, {
        initialValue: this.route.snapshot.queryParamMap,
    });
    private readonly searchInput = new Subject<string>();
    private readonly scenario = inject(Scenario);
    readonly sorts = this.kind === 'requests' ? REQUEST_SORTS : ASSET_SORTS;

    readonly query = computed(() => {
        const params = this.parameters();
        return normalizeQuery(
            this.kind,
            Object.fromEntries(
                ['q', 'sort', 'page', 'pageSize'].map((key) => [
                    key,
                    params.get(key),
                ]),
            ),
        );
    });

    constructor() {
        let lastReset = this.scenario.resetVersion();
        effect(() => {
            const version = this.scenario.resetVersion();
            if (version !== lastReset) {
                lastReset = version;
                untracked(() => this.reset());
            }
        });
        this.searchInput
            .pipe(debounceTime(250), takeUntilDestroyed())
            .subscribe((q) => this.update({ q, page: 1 }));
        effect(() => {
            const raw = this.parameters();
            const desired = this.asParams(this.query());
            if (
                ['q', 'sort', 'page', 'pageSize'].some(
                    (key) => raw.get(key) !== desired[key],
                )
            )
                untracked(() => this.navigate(this.query(), true));
        });
    }

    search(value: string): void {
        this.searchInput.next(value);
    }

    update(patch: Partial<ListQuery>, replace = false): void {
        const next = normalizeQuery(
            this.kind,
            Object.fromEntries(
                Object.entries({ ...this.query(), ...patch }).map(
                    ([key, value]) => [key, String(value)],
                ),
            ),
        );
        if (JSON.stringify(next) !== JSON.stringify(this.query()))
            this.navigate(next, replace);
    }

    reset(): void {
        this.searchInput.next('');
        this.navigate(normalizeQuery(this.kind, {}), true);
    }

    private asParams(query: ListQuery): Record<string, string | null> {
        return {
            q: query.q || null,
            sort: query.sort === this.sorts[0] ? null : query.sort,
            page: query.page === 1 ? null : String(query.page),
            pageSize: query.pageSize === 25 ? null : String(query.pageSize),
        };
    }

    private navigate(query: ListQuery, replaceUrl: boolean): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: this.asParams(query),
            replaceUrl,
        });
    }
}

export function queryParams(
    query: ListQuery,
    context: string,
): Record<string, string> {
    return {
        q: query.q,
        sort: query.sort,
        page: String(query.page),
        pageSize: String(query.pageSize),
        context,
    };
}
