import { computed, inject, Injectable } from '@angular/core';
import { DEMO_SESSION, SCENARIO_CONTEXT } from './mock-repository';

@Injectable({ providedIn: 'root' })
export class DemoContext {
    private readonly session = inject(DEMO_SESSION);
    private readonly scenario = inject(SCENARIO_CONTEXT);
    readonly identity = computed(() => this.session().identity);

    readonly key = computed(
        () =>
            `${this.session().identity.personId}:${this.session().epoch}:${this.scenario().generation}`,
    );
}

export function responseError(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error) {
        const detail = (error as { error: unknown }).error;
        if (
            detail &&
            typeof detail === 'object' &&
            'message' in detail &&
            typeof detail.message === 'string'
        )
            return detail.message;
    }
    return 'We could not load the records. Please try again.';
}
