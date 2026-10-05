import { Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssetSummary, DashboardSummary, PageResult, RequestSummary } from 'domain';
import { StatusBadge } from 'ui';
import { DemoContext, responseError } from '../../core/mock-http/context';
import { Scenario } from '../../core/scenarios/scenario';

@Component({ imports: [RouterLink, DatePipe, StatusBadge], templateUrl: './dashboard.html' })
export class Dashboard {
  readonly context = inject(DemoContext);
  private readonly scenario = inject(Scenario);
  private readonly summaryResource = httpResource<DashboardSummary>(() => ({ url: '/api/dashboard', params: { context: this.context.key() } }));
  private readonly requestsResource = httpResource<PageResult<RequestSummary>>(() => ({ url: '/api/requests', params: { context: this.context.key() } }));
  private readonly assetsResource = httpResource<PageResult<AssetSummary>>(() => ({ url: '/api/assets', params: { context: this.context.key() } }));
  readonly summary = computed(() => this.summaryResource.hasValue() && !this.summaryResource.isLoading() && this.summaryResource.value()?.contextKey === this.context.key() ? this.summaryResource.value() : undefined);
  readonly requests = computed(() => this.requestsResource.hasValue() && !this.requestsResource.isLoading() && this.requestsResource.value()?.contextKey === this.context.key() ? this.requestsResource.value()?.items.slice(0, 5) ?? [] : []);
  readonly assets = computed(() => this.assetsResource.hasValue() && !this.assetsResource.isLoading() && this.assetsResource.value()?.contextKey === this.context.key() ? this.assetsResource.value()?.items.slice(0, 4) ?? [] : []);
  readonly loading = this.summaryResource.isLoading;
  readonly error = computed(() => this.summaryResource.error() ? responseError(this.summaryResource.error()) : '');
  readonly roleDescription = computed(() => ({ employee: 'Your requests and assigned equipment, in one place.', manager: 'A clear view of your team’s requests and equipment.', administrator: 'Requests and inventory across the organization.' })[this.context.identity().role]);
  retry(): void { this.scenario.retry(); this.summaryResource.reload(); this.requestsResource.reload(); this.assetsResource.reload(); }
}
