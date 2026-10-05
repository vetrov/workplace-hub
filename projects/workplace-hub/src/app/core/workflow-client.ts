import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, finalize, takeUntil } from 'rxjs';
import { RecordResult } from 'domain';
import { DemoContext, responseError } from './mock-http/context';
import { Scenario } from './scenarios/scenario';

@Injectable()
export class WorkflowClient {
    private readonly http = inject(HttpClient);
    private readonly context = inject(DemoContext);
    private readonly scenario = inject(Scenario);
    private readonly destroy = inject(DestroyRef);
    private readonly changes = toObservable(this.context.key);
    readonly busy = signal(false);
    readonly error = signal('');

    constructor() {
        effect(() => {
            this.context.key();
            this.error.set('');
        });
    }

    run<T>(
        method: 'POST' | 'PATCH',
        url: string,
        body: unknown,
        success: (record: T) => void,
    ): void {
        if (this.busy()) return;
        const key = this.context.key(),
            snapshot = structuredClone(body);
        this.busy.set(true);
        this.error.set('');
        let completed = false;
        this.http
            .request<RecordResult<T>>(method, url, { body: snapshot })
            .pipe(
                takeUntil(
                    this.changes.pipe(filter(() => this.context.key() !== key)),
                ),
                takeUntilDestroyed(this.destroy),
                finalize(() => {
                    this.busy.set(false);
                    if (!completed && key !== this.context.key())
                        this.error.set(
                            'The pending action was canceled because the demo context changed.',
                        );
                }),
            )
            .subscribe({
                next: (result) => {
                    if (key !== this.context.key()) return;
                    completed = true;
                    this.busy.set(false);
                    this.scenario.refresh();
                    success(result.record);
                },
                error: (error) => this.error.set(responseError(error)),
            });
    }
}
