import { RoleOnly } from '../../core/role-only';
import {
    booleanAttribute,
    Component,
    computed,
    inject,
    input,
    linkedSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import {
    Allocation,
    AssetDetail,
    CollectionResult,
    RequestDetail,
    Supplier,
} from 'domain';
import { StatusBadge } from 'ui';
import { DemoContext, responseError } from '../../core/mock-http/context';
import { Session } from '../../core/session/session';
import { Scenario } from '../../core/scenarios/scenario';
import { WorkflowClient } from '../../core/workflow-client';
import { collectionResource, recordResource } from '../../core/workflow-read';
import { personName } from '../../core/record-labels';

@Component({
    imports: [RouterLink, DatePipe, StatusBadge, RoleOnly],
    providers: [WorkflowClient],
    templateUrl: './asset-detail.html',
})
export class AssetDetailPage {
    readonly id = input.required<string>();
    readonly assignment = input(false, { transform: booleanAttribute });
    private readonly session = inject(Session);
    private readonly context = inject(DemoContext);
    private readonly scenario = inject(Scenario);
    private readonly router = inject(Router);
    readonly mutation = inject(WorkflowClient);
    readonly reader = recordResource<AssetDetail>(
        () => `/api/assets/${encodeURIComponent(this.id())}`,
    );
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly personName = personName;
    private readonly suppliers = collectionResource<Supplier>(
        () => '/api/supplier-options',
    );
    readonly supplierName = (id: string) =>
        this.suppliers.items().find((s) => s.id === id)?.name ?? id;

    readonly candidates = httpResource<CollectionResult<RequestDetail>>(() =>
        this.assignment() &&
        this.administrator() &&
        this.reader.record()?.status === 'available'
            ? {
                  url: '/api/assignment-options',
                  params: { assetId: this.id(), context: this.context.key() },
              }
            : undefined,
    );

    readonly options = computed(() =>
        this.candidates.hasValue() &&
        !this.candidates.isLoading() &&
        this.candidates.value().contextKey === this.context.key()
            ? this.candidates.value().items
            : [],
    );

    readonly optionError = computed(() =>
        this.candidates.error() ? responseError(this.candidates.error()) : '',
    );

    readonly selected = linkedSignal<readonly RequestDetail[], string>({
        source: this.options,
        computation: (items, previous) =>
            items.some((r) => r.id === previous?.value)
                ? previous!.value
                : (items[0]?.id ?? ''),
    });

    readonly request = computed(() =>
        this.options().find((r) => r.id === this.selected()),
    );

    retryOptions(): void {
        this.scenario.retry();
        this.candidates.reload();
    }

    assign(): void {
        const asset = this.reader.record(),
            request = this.request();
        if (!asset || !request || !this.administrator()) return;
        this.mutation.run<Allocation>(
            'POST',
            `/api/assets/${asset.id}/assign`,
            {
                requestId: request.id,
                requestVersion: request.version,
                assetVersion: asset.version,
            },
            () => {
                void this.router.navigate(['/assets', asset.id]);
            },
        );
    }
}
