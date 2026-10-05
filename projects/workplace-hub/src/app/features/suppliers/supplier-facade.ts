import { DestroyRef, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    filter,
    finalize,
    map,
    of,
    shareReplay,
    startWith,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DemoContext, responseError } from '../../core/mock-http/context';
import { Scenario } from '../../core/scenarios/scenario';
import { SupplierClient, SupplierQuery } from './supplier-client';
import { SupplierDetail } from 'domain';

interface ReadState<T> {
    loading: boolean;
    error: string;
    value: T | null;
    key: string;
}

@Injectable()
export class SupplierFacade {
    private readonly query = new BehaviorSubject<SupplierQuery>({
        q: '',
        page: 1,
    });
    private readonly recordId = new BehaviorSubject<string | undefined>(
        undefined,
    );
    private readonly reload = new BehaviorSubject(0);
    readonly busy = new BehaviorSubject(false);
    readonly saveError = new BehaviorSubject('');
    readonly directory$;
    readonly detail$;
    private readonly context$;

    constructor(
        private readonly client: SupplierClient,
        readonly context: DemoContext,
        private readonly scenario: Scenario,
        private readonly destroy: DestroyRef,
        injector: Injector,
    ) {
        this.context$ = toObservable(context.key, { injector });
        this.context$
            .pipe(takeUntilDestroyed(destroy))
            .subscribe(() => this.saveError.next(''));
        this.directory$ = combineLatest([
            this.context$,
            this.query,
            this.reload,
        ]).pipe(
            switchMap(([key, query]) =>
                this.client.directory(query, key).pipe(
                    map((value) => ({ loading: false, error: '', value, key })),
                    startWith({ loading: true, error: '', value: null, key }),
                    catchError((error) =>
                        of({
                            loading: false,
                            error: responseError(error),
                            value: null,
                            key,
                        }),
                    ),
                ),
            ),
            takeUntilDestroyed(destroy),
            shareReplay({ bufferSize: 1, refCount: true }),
        );
        this.detail$ = combineLatest([
            this.context$,
            this.recordId,
            this.reload,
        ]).pipe(
            switchMap(([key, id]) =>
                id
                    ? this.client.detail(id, key).pipe(
                          map((result) => ({
                              loading: false,
                              error: '',
                              value: result.record,
                              key,
                          })),
                          startWith({
                              loading: true,
                              error: '',
                              value: null,
                              key,
                          }),
                          catchError((error) =>
                              of({
                                  loading: false,
                                  error: responseError(error),
                                  value: null,
                                  key,
                              }),
                          ),
                      )
                    : of({ loading: false, error: '', value: null, key }),
            ),
            takeUntilDestroyed(destroy),
            shareReplay({ bufferSize: 1, refCount: true }),
        );
    }

    setQuery(query: SupplierQuery): void {
        this.query.next(query);
    }

    setRecord(id: string | undefined): void {
        this.recordId.next(id);
    }

    retry(): void {
        this.scenario.retry();
        this.reload.next(this.reload.value + 1);
    }

    save(
        id: string | undefined,
        body: unknown,
        success: (record: SupplierDetail) => void,
    ): void {
        if (this.busy.value) return;
        const key = this.context.key();
        this.busy.next(true);
        this.saveError.next('');
        this.client
            .save(id, structuredClone(body))
            .pipe(
                takeUntil(this.context$.pipe(filter((value) => value !== key))),
                takeUntilDestroyed(this.destroy),
                finalize(() => this.busy.next(false)),
            )
            .subscribe({
                next: (result) => {
                    if (key !== this.context.key()) return;
                    this.busy.next(false);
                    this.scenario.refresh();
                    success(result.record);
                },
                error: (error) => this.saveError.next(responseError(error)),
            });
    }
}
