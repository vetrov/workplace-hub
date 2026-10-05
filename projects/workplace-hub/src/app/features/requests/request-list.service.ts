import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PageResult, RequestSummary } from 'domain';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ListQueryState, queryParams } from '../../core/list-query';
import { DemoContext, responseError } from '../../core/mock-http/context';

export interface ListState<T> {
  readonly loading: boolean;
  readonly error: string;
  readonly page: PageResult<T> | null;
  readonly key: string;
}

@Injectable()
export class RequestListService {
  private readonly http = inject(HttpClient);
  readonly query = inject(ListQueryState);
  private readonly context = inject(DemoContext);
  private readonly refresh = signal(0);
  private readonly trigger = computed(() => ({
    query: this.query.query(),
    context: this.context.key(),
    refresh: this.refresh(),
  }));
  private readonly key = computed(() => JSON.stringify(this.trigger()));
  private readonly raw = toSignal(
    toObservable(this.trigger).pipe(
      switchMap((trigger) => {
        const key = JSON.stringify(trigger);
        return this.http
          .get<PageResult<RequestSummary>>('/api/requests', {
            params: queryParams(trigger.query, trigger.context),
          })
          .pipe(
            map((page) => ({ loading: false, error: '', page, key }) as ListState<RequestSummary>),
            startWith({ loading: true, error: '', page: null, key } as ListState<RequestSummary>),
            catchError((error) =>
              of({
                loading: false,
                error: responseError(error),
                page: null,
                key,
              } as ListState<RequestSummary>),
            ),
          );
      }),
    ),
    {
      initialValue: { loading: true, error: '', page: null, key: '' } as ListState<RequestSummary>,
    },
  );
  readonly state = computed(() =>
    this.raw().key === this.key()
      ? this.raw()
      : { loading: true, error: '', page: null, key: this.key() },
  );

  constructor() {
    effect(() => {
      const page = this.state().page;
      if (page && page.page !== this.query.query().page)
        untracked(() => this.query.update({ page: page.page }, true));
    });
  }
  retry(): void {
    this.refresh.update((value) => value + 1);
  }
}
