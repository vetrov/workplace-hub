import {
    Component,
    computed,
    inject,
    input,
    linkedSignal,
    signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CollectionResult, RequestDetail } from 'domain';
import { DemoContext, responseError } from '../../core/mock-http/context';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { WorkflowClient } from '../../core/workflow-client';
import { personName } from '../../core/record-labels';
import { RequestFacts } from '../requests/request-facts';
import { ApprovalActions } from './approval-actions';
import { ApprovalCategory, ApprovalFilter } from './approval-filter';

@Component({
    imports: [RouterLink, RequestFacts, ApprovalActions, ApprovalFilter],
    providers: [WorkflowClient],
    templateUrl: './approvals.html',
})
export class Approvals {
    readonly id = input<string>();
    readonly session = inject(Session);
    private readonly router = inject(Router);
    private readonly context = inject(DemoContext);
    private readonly scenario = inject(Scenario);
    readonly mutation = inject(WorkflowClient);
    readonly manager = computed(
        () => this.session.identity().role === 'manager',
    );
    readonly category = signal<ApprovalCategory>('all');
    readonly notice = signal('');
    readonly personName = personName;
    readonly resource = httpResource<CollectionResult<RequestDetail>>(() =>
        this.manager()
            ? { url: '/api/approvals', params: { context: this.context.key() } }
            : undefined,
    );

    readonly items = computed(() =>
        this.resource.hasValue() &&
        !this.resource.isLoading() &&
        this.resource.value().contextKey === this.context.key()
            ? this.resource.value().items
            : [],
    );

    readonly visible = computed(() =>
        this.items().filter(
            (r) => this.category() === 'all' || r.category === this.category(),
        ),
    );
    readonly error = computed(() =>
        this.resource.error() ? responseError(this.resource.error()) : '',
    );

    readonly selected = linkedSignal<
        {
            identity: string;
            ids: readonly string[];
            requested: string | undefined;
        },
        string | null
    >({
        source: () => ({
            identity: this.session.identity().personId,
            ids: this.visible().map((r) => r.id),
            requested: this.id(),
        }),
        computation: (source, previous) =>
            source.requested
                ? source.ids.includes(source.requested)
                    ? source.requested
                    : null
                : previous?.source.identity === source.identity &&
                    previous.value &&
                    source.ids.includes(previous.value)
                  ? previous.value
                  : (source.ids[0] ?? null),
    });

    readonly request = computed(() =>
        this.visible().find((r) => r.id === this.selected()),
    );

    select(id: string): void {
        if (this.id()) void this.router.navigate(['/approvals', id]);
        else this.selected.set(id);
    }

    decide(input: { decision: 'approve' | 'reject'; reason: string }): void {
        const request = this.request();
        if (!request) return;
        this.mutation.run<RequestDetail>(
            'POST',
            `/api/requests/${request.id}/decision`,
            { ...input, version: request.version },
            (record) =>
                this.notice.set(`Request ${record.id} ${record.status}.`),
        );
    }

    retry(): void {
        this.scenario.retry();
        this.resource.reload();
    }
}
