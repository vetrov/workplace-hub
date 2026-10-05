import {
    HttpErrorResponse,
    HttpInterceptorFn,
    HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, EMPTY, mergeMap, of, throwError, timer } from 'rxjs';
import { WorkflowError, normalizeQuery } from 'domain';
import { DEMO_SESSION, REPOSITORY, SCENARIO_CONTEXT } from './mock-repository';
import { DEMO_IDENTITIES } from './seed-data';

export const mockInterceptor: HttpInterceptorFn = (request) => {
    const error = (status: number, message: string) =>
        throwError(
            () =>
                new HttpErrorResponse({
                    status,
                    url: request.url,
                    error: { message },
                }),
        );
    if (!request.url.startsWith('/api/'))
        return error(404, 'Only local demo API requests are supported.');
    const repository = inject(REPOSITORY),
        sessionReader = inject(DEMO_SESSION),
        scenarioReader = inject(SCENARIO_CONTEXT);
    return defer(() => {
        const session = sessionReader(),
            scenario = scenarioReader(),
            actor = session.identity;
        const contextKey = `${actor.personId}:${session.epoch}:${scenario.generation}`;
        const write = request.method !== 'GET';
        let bodySnapshot: unknown;
        try {
            bodySnapshot = structuredClone(request.body);
        } catch {
            return error(400, 'Use a serializable command body.');
        }
        return timer(scenario.mode === 'delayed' ? 2000 : 250).pipe(
            mergeMap(() => {
                if (
                    sessionReader().epoch !== session.epoch ||
                    scenarioReader().generation !== scenario.generation
                )
                    return write
                        ? error(
                              409,
                              'The demo context changed. This command was canceled.',
                          )
                        : EMPTY;
                if (
                    !DEMO_IDENTITIES.some(
                        (a) =>
                            a.personId === actor.personId &&
                            a.role === actor.role &&
                            a.teamId === actor.teamId,
                    )
                )
                    return error(403, 'This demo identity is unavailable.');
                const params = Object.fromEntries(
                    request.params
                        .keys()
                        .map((k) => [k, request.params.get(k) ?? '']),
                );
                const requestMatch = request.url.match(
                    /^\/api\/requests\/([^/]+)(?:\/(decision))?$/,
                );
                const assetMatch = request.url.match(
                    /^\/api\/assets\/([^/]+)(?:\/(assign))?$/,
                );
                const supplierMatch = request.url.match(
                    /^\/api\/suppliers\/([^/]+)$/,
                );
                const policyMatch = request.url.match(
                    /^\/api\/policies\/([^/]+)$/,
                );
                const personMatch = request.url.match(
                    /^\/api\/people\/([^/]+)$/,
                );
                const teamMatch = request.url.match(
                    /^\/api\/teams\/([^/]+)(?:\/(transfer))?$/,
                );
                const reportMatch = request.url.match(
                    /^\/api\/reports\/([^/]+)(?:\/(export))?$/,
                );
                const categoryMatch = request.url.match(
                    /^\/api\/config\/categories\/([^/]+)$/,
                );
                const methods: Record<string, () => unknown> = {};
                const record = (value: unknown) => ({
                    record: value,
                    contextKey,
                });
                const collection = (items: unknown) => ({ items, contextKey });
                if (request.url === '/api/people') {
                    methods['GET'] = () => {
                        const q = (params['q'] ?? '').trim().toLowerCase(),
                            items = repository
                                .people(actor)
                                .filter((p) =>
                                    `${p.id} ${p.name} ${p.email}`
                                        .toLowerCase()
                                        .includes(q),
                                );
                        const requested = normalizeQuery('assets', params).page,
                            page = Math.min(
                                requested,
                                Math.max(1, Math.ceil(items.length / 25)),
                            );
                        return {
                            items: items.slice((page - 1) * 25, page * 25),
                            total: items.length,
                            page,
                            pageSize: 25,
                            contextKey,
                        };
                    };
                } else if (request.url === '/api/people-options')
                    methods['GET'] = () => collection(repository.people(actor));
                else if (personMatch)
                    methods['GET'] = () =>
                        record(repository.person(personMatch[1], actor));
                else if (request.url === '/api/teams')
                    methods['GET'] = () => collection(repository.teams(actor));
                else if (teamMatch) {
                    if (teamMatch[2])
                        methods['POST'] = () =>
                            record(
                                repository.transfer(
                                    teamMatch[1],
                                    bodySnapshot,
                                    actor,
                                ),
                            );
                    else
                        methods['GET'] = () =>
                            record(repository.team(teamMatch[1], actor));
                } else if (request.url === '/api/reports') {
                    methods['GET'] = () =>
                        collection(repository.reports(actor));
                    methods['POST'] = () =>
                        record(repository.createReport(bodySnapshot, actor));
                } else if (reportMatch)
                    methods['GET'] = () =>
                        record(
                            reportMatch[2]
                                ? repository.exportReport(reportMatch[1], actor)
                                : repository.report(reportMatch[1], actor),
                        );
                else if (request.url === '/api/organization')
                    methods['GET'] = () =>
                        record(repository.organization(actor));
                else if (request.url === '/api/config/roles') {
                    methods['GET'] = () => record(repository.roles(actor));
                    methods['PATCH'] = () =>
                        record(repository.updateRoles(bodySnapshot, actor));
                } else if (request.url === '/api/config/settings') {
                    methods['GET'] = () => record(repository.settings(actor));
                    methods['PATCH'] = () =>
                        record(repository.updateSettings(bodySnapshot, actor));
                } else if (request.url === '/api/config/categories')
                    methods['GET'] = () =>
                        collection(repository.categories(actor));
                else if (categoryMatch)
                    methods['PATCH'] = () =>
                        record(
                            repository.updateCategory(
                                categoryMatch[1],
                                bodySnapshot,
                                actor,
                            ),
                        );
                else if (request.url === '/api/requests') {
                    methods['GET'] = () =>
                        repository.list('requests', params, actor, contextKey);
                    methods['POST'] = () =>
                        record(repository.createRequest(bodySnapshot, actor));
                } else if (request.url === '/api/assets') {
                    methods['GET'] = () =>
                        repository.list('assets', params, actor, contextKey);
                    methods['POST'] = () =>
                        record(repository.createAsset(bodySnapshot, actor));
                } else if (request.url === '/api/suppliers') {
                    methods['GET'] = () => {
                        const query = normalizeQuery('assets', params);
                        const needle = query.q.toLowerCase();
                        const items = repository
                            .suppliers(actor)
                            .filter((s) =>
                                `${s.id} ${s.name} ${s.email}`
                                    .toLowerCase()
                                    .includes(needle),
                            )
                            .sort(
                                (a, b) =>
                                    a.name.localeCompare(b.name) ||
                                    a.id.localeCompare(b.id),
                            );
                        const page = Math.min(
                            query.page,
                            Math.max(1, Math.ceil(items.length / 25)),
                        );
                        return {
                            items: items.slice((page - 1) * 25, page * 25),
                            total: items.length,
                            page,
                            pageSize: 25,
                            contextKey,
                        };
                    };
                    methods['POST'] = () =>
                        record(repository.createSupplier(bodySnapshot, actor));
                } else if (request.url === '/api/supplier-options') {
                    methods['GET'] = () =>
                        collection(repository.supplierOptions(actor));
                } else if (supplierMatch) {
                    methods['GET'] = () =>
                        record(repository.supplier(supplierMatch[1], actor));
                    methods['PATCH'] = () =>
                        record(
                            repository.updateSupplier(
                                supplierMatch[1],
                                bodySnapshot,
                                actor,
                            ),
                        );
                } else if (request.url === '/api/policies') {
                    methods['GET'] = () =>
                        collection(repository.policies(actor));
                } else if (policyMatch) {
                    methods['GET'] = () =>
                        record(repository.policy(policyMatch[1], actor));
                    methods['PATCH'] = () =>
                        record(
                            repository.updatePolicy(
                                policyMatch[1],
                                bodySnapshot,
                                actor,
                            ),
                        );
                } else if (request.url === '/api/dashboard')
                    methods['GET'] = () =>
                        repository.dashboard(actor, contextKey);
                else if (request.url === '/api/approvals')
                    methods['GET'] = () =>
                        collection(repository.approvals(actor));
                else if (request.url === '/api/assignment-options')
                    methods['GET'] = () =>
                        collection(
                            repository.assignmentOptions(
                                params['assetId'],
                                actor,
                            ),
                        );
                else if (requestMatch) {
                    if (requestMatch[2])
                        methods['POST'] = () =>
                            record(
                                repository.decide(
                                    requestMatch[1],
                                    bodySnapshot,
                                    actor,
                                ),
                            );
                    else {
                        methods['GET'] = () =>
                            record(repository.request(requestMatch[1], actor));
                        methods['PATCH'] = () =>
                            record(
                                repository.updateRequest(
                                    requestMatch[1],
                                    bodySnapshot,
                                    actor,
                                ),
                            );
                    }
                } else if (assetMatch) {
                    if (assetMatch[2])
                        methods['POST'] = () =>
                            record(
                                repository.assign(
                                    assetMatch[1],
                                    bodySnapshot,
                                    actor,
                                ),
                            );
                    else {
                        methods['GET'] = () =>
                            record(repository.asset(assetMatch[1], actor));
                        methods['PATCH'] = () =>
                            record(
                                repository.updateAsset(
                                    assetMatch[1],
                                    bodySnapshot,
                                    actor,
                                ),
                            );
                    }
                } else return error(404, 'The demo endpoint does not exist.');
                const execute = methods[request.method];
                if (!execute)
                    return error(
                        405,
                        'This method is not supported for the demo endpoint.',
                    );
                if (scenario.mode === 'error')
                    return error(
                        503,
                        'The demo response failed. Retry to restore normal responses.',
                    );
                if (scenario.mode === 'empty' && write)
                    return error(
                        409,
                        'Restore normal responses before changing demo records.',
                    );
                try {
                    let body = execute();
                    if (scenario.mode === 'empty') {
                        if (
                            typeof body === 'object' &&
                            body &&
                            'record' in body
                        )
                            return error(
                                404,
                                'No record exists in the empty demo scenario.',
                            );
                        if (typeof body === 'object' && body && 'items' in body)
                            body = { ...body, items: [], total: 0, page: 1 };
                        else
                            body = {
                                requests: 0,
                                pending: 0,
                                assets: 0,
                                available: 0,
                                contextKey,
                            };
                    }
                    return of(new HttpResponse({ status: 200, body }));
                } catch (cause) {
                    return cause instanceof WorkflowError
                        ? error(cause.status, cause.message)
                        : error(
                              500,
                              'The demo command could not be completed.',
                          );
                }
            }),
        );
    });
};
