import { computed, effect, inject, Injectable, untracked } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { AssetSummary, PageResult } from 'domain';
import { ListQueryState, queryParams } from '../../core/list-query';
import { DemoContext, responseError } from '../../core/mock-http/context';

@Injectable()
export class AssetListService {
  readonly query = inject(ListQueryState);
  private readonly context = inject(DemoContext);
  private readonly resource = httpResource<PageResult<AssetSummary>>(() => ({
    url: '/api/assets',
    params: queryParams(this.query.query(), this.context.key()),
  }));
  readonly state = computed(() => {
    if (this.resource.isLoading()) return { loading: true, error: '', page: null };
    if (this.resource.error())
      return { loading: false, error: responseError(this.resource.error()), page: null };
    const page = this.resource.hasValue() ? this.resource.value() : undefined;
    if (
      !page ||
      page.contextKey !== this.context.key() ||
      page.queryKey !== JSON.stringify(this.query.query())
    )
      return { loading: true, error: '', page: null };
    return { loading: false, error: '', page };
  });

  constructor() {
    effect(() => {
      const page = this.state().page;
      if (page && page.page !== this.query.query().page)
        untracked(() => this.query.update({ page: page.page }, true));
    });
  }
  retry(): void {
    this.resource.reload();
  }
}
