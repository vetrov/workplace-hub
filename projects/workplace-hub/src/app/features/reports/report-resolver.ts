import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, defaultIfEmpty, filter, map, of, takeUntil } from 'rxjs';
import { RecordResult, ReportRun } from 'domain';
import { DemoContext, responseError } from '../../core/mock-http/context';

export type ReportResolution =
    | {
          readonly kind: 'ready';
          readonly contextKey: string;
          readonly run: ReportRun;
      }
    | {
          readonly kind: 'error' | 'context-changed';
          readonly contextKey: string;
          readonly message: string;
      };

export const reportResolver: ResolveFn<ReportResolution> = (route) => {
    const http = inject(HttpClient),
        context = inject(DemoContext),
        key = context.key(),
        id = route.paramMap.get('id')!;
    const canceled: ReportResolution = {
        kind: 'context-changed',
        contextKey: key,
        message: 'The demo context changed. Reload this report.',
    };
    return http
        .get<RecordResult<ReportRun>>(
            `/api/reports/${encodeURIComponent(id)}`,
            { params: { context: key } },
        )
        .pipe(
            takeUntil(
                context.changes$.pipe(filter(() => context.key() !== key)),
            ),
            map((response): ReportResolution =>
                context.key() === key &&
                response.contextKey === key &&
                response.record.report.id === id
                    ? { kind: 'ready', contextKey: key, run: response.record }
                    : canceled,
            ),
            defaultIfEmpty(canceled),
            catchError((error) =>
                of<ReportResolution>({
                    kind: 'error',
                    contextKey: key,
                    message: responseError(error),
                }),
            ),
        );
};
