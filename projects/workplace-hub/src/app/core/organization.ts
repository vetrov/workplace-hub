import {
    computed,
    effect,
    inject,
    Injectable,
    signal,
    untracked,
} from '@angular/core';
import { OrganizationSummary } from 'domain';
import { recordResource } from './workflow-read';
import { Session } from './session/session';
import { Scenario } from './scenarios/scenario';

@Injectable({ providedIn: 'root' })
export class Organization {
    private readonly session = inject(Session);
    private readonly scenario = inject(Scenario);
    private readonly scope = computed(
        () => `${this.session.epoch()}:${this.scenario.resetVersion()}`,
    );
    private readonly cache = signal<
        { scope: string; record: OrganizationSummary } | undefined
    >(undefined);
    private readonly reader = recordResource<OrganizationSummary>(
        () => '/api/organization',
    );
    readonly record = computed(
        () =>
            this.reader.record() ??
            (this.cache()?.scope === this.scope()
                ? this.cache()?.record
                : undefined),
    );
    readonly loading = this.reader.loading;
    readonly error = this.reader.error;
    readonly retry = this.reader.retry;

    constructor() {
        effect(() => {
            const record = this.reader.record(),
                scope = this.scope();
            if (record) untracked(() => this.cache.set({ scope, record }));
        });
    }
}
