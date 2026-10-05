import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { normalizeQuery, PageResult } from 'domain';
import { DemoContext, responseError } from './mock-http/context';
import { Scenario } from './scenarios/scenario';

export function directoryRead<T>(endpoint: string) {
    const context = inject(DemoContext),
        scenario = inject(Scenario),
        route = inject(ActivatedRoute),
        router = inject(Router);
    const params = toSignal(route.queryParamMap, {
        initialValue: route.snapshot.queryParamMap,
    });
    const query = computed(() =>
        normalizeQuery('assets', {
            q: params().get('q'),
            page: params().get('page'),
        }),
    );
    const resource = httpResource<PageResult<T>>(() => ({
        url: endpoint,
        params: { q: query().q, page: query().page, context: context.key() },
    }));
    const result = computed(() =>
        resource.hasValue() &&
        !resource.isLoading() &&
        resource.value().contextKey === context.key()
            ? resource.value()
            : undefined,
    );
    return {
        query,
        result,
        loading: resource.isLoading,
        error: computed(() =>
            resource.error() ? responseError(resource.error()) : '',
        ),
        search: (q: string) =>
            void router.navigate([], {
                relativeTo: route,
                queryParams: { q: q.trim() || null, page: null },
            }),
        page: (page: number) =>
            void router.navigate([], {
                relativeTo: route,
                queryParams: { q: query().q || null, page },
            }),
        retry: () => {
            scenario.retry();
            resource.reload();
        },
    };
}
