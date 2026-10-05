import { computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CollectionResult, RecordResult } from 'domain';
import { DemoContext, responseError } from './mock-http/context';
import { Scenario } from './scenarios/scenario';

export function recordResource<T>(url: () => string | undefined) {
    const context = inject(DemoContext),
        scenario = inject(Scenario);
    const resource = httpResource<RecordResult<T>>(() => {
        const path = url();
        return path
            ? { url: path, params: { context: context.key() } }
            : undefined;
    });
    return {
        record: computed(() =>
            resource.hasValue() &&
            !resource.isLoading() &&
            resource.value().contextKey === context.key()
                ? resource.value().record
                : undefined,
        ),
        loading: resource.isLoading,
        error: computed(() =>
            resource.error() ? responseError(resource.error()) : '',
        ),
        retry: () => {
            scenario.retry();
            resource.reload();
        },
    };
}

export function collectionResource<T>(url: () => string | undefined) {
    const context = inject(DemoContext),
        scenario = inject(Scenario);
    const resource = httpResource<CollectionResult<T>>(() => {
        const path = url();
        return path
            ? { url: path, params: { context: context.key() } }
            : undefined;
    });
    return {
        items: computed(() =>
            resource.hasValue() &&
            !resource.isLoading() &&
            resource.value().contextKey === context.key()
                ? resource.value().items
                : [],
        ),
        loading: resource.isLoading,
        error: computed(() =>
            resource.error() ? responseError(resource.error()) : '',
        ),
        retry: () => {
            scenario.retry();
            resource.reload();
        },
    };
}
