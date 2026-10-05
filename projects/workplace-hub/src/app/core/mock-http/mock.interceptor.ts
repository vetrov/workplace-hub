import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, EMPTY, mergeMap, of, throwError, timer } from 'rxjs';
import { DEMO_SESSION, REPOSITORY, SCENARIO_CONTEXT } from './mock-repository';
import { DEMO_IDENTITIES } from './seed-data';

export const mockInterceptor: HttpInterceptorFn = (request) => {
  if (!request.url.startsWith('/api/'))
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 404,
          error: { message: 'Only local demo API requests are supported.' },
        }),
    );
  const repository = inject(REPOSITORY);
  const sessionReader = inject(DEMO_SESSION);
  const scenarioReader = inject(SCENARIO_CONTEXT);
  return defer(() => {
    const session = sessionReader();
    const scenario = scenarioReader();
    const contextKey = `${session.identity.personId}:${session.epoch}:${scenario.generation}`;
    return timer(scenario.mode === 'delayed' ? 2000 : 250).pipe(
      mergeMap(() => {
        if (
          sessionReader().epoch !== session.epoch ||
          scenarioReader().generation !== scenario.generation
        )
          return EMPTY;
        const error = (status: number, message: string) =>
          throwError(() => new HttpErrorResponse({ status, url: request.url, error: { message } }));
        if (
          !DEMO_IDENTITIES.some(
            (identity) =>
              identity.personId === session.identity.personId &&
              identity.role === session.identity.role &&
              identity.teamId === session.identity.teamId,
          )
        )
          return error(403, 'This demo identity is unavailable.');
        if (!['/api/requests', '/api/assets', '/api/dashboard'].includes(request.url))
          return error(404, 'The demo endpoint does not exist.');
        if (request.method !== 'GET')
          return error(405, 'This foundation supports read-only requests.');
        if (scenario.mode === 'error')
          return error(503, 'The demo response failed. Retry to restore normal responses.');
        const params = Object.fromEntries(
          request.params.keys().map((key) => [key, request.params.get(key) ?? '']),
        );
        let body =
          request.url === '/api/dashboard'
            ? repository.dashboard(session.identity, contextKey)
            : repository.list(
                request.url === '/api/requests' ? 'requests' : 'assets',
                params,
                session.identity,
                contextKey,
              );
        if (scenario.mode === 'empty')
          body =
            'items' in body
              ? { ...body, items: [], total: 0, page: 1 }
              : { ...body, requests: 0, pending: 0, assets: 0, available: 0 };
        return of(new HttpResponse({ status: 200, body }));
      }),
    );
  });
};
