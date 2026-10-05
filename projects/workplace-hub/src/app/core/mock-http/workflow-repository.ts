import {
    Allocation,
    AssetDetail,
    AuditEvent,
    canEditRequest,
    canReviewRequest,
    canSeeAsset,
    canSeeRequest,
    commandBody,
    DemoIdentity,
    expectedVersion,
    RequestDetail,
    requireRule,
    SeedData,
    validateAsset,
    validateDecision,
    validateRequest,
    WorkflowStore,
} from 'domain';
import { createSeedData, DEMO_IDENTITIES } from './seed-data';

function immutable<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(immutable);
        Object.freeze(value);
    }
    return value;
}

export class WorkflowRepository implements WorkflowStore {
    data!: SeedData;
    private requestCounter = 250;
    private assetCounter = 2000;
    private eventCounter = 0;

    constructor(private readonly clock = () => new Date().toISOString()) {
        this.reset();
    }

    reset(): void {
        const seed = createSeedData();
        this.requestCounter = 250;
        this.assetCounter = 2000;
        this.eventCounter = 0;
        this.data = immutable({
            ...seed,
            requests: seed.requests.map((r) => ({
                ...r,
                version: 1,
                justification:
                    'Seeded workplace request for equipment, software or services.',
                delivery: {
                    location: 'Helsinki office',
                    neededBy: '2026-12-01',
                },
                items: [{ description: r.title, quantity: 1, unitCost: 250 }],
                allocatedAssetId: null,
                history: [
                    {
                        id: `H-SEED-${r.id}`,
                        action: 'seeded',
                        actorId: r.requesterId,
                        occurredAt: r.createdAt,
                        note: `Initial demo record (${r.status}).`,
                    },
                ],
            })),
            assets: seed.assets.map((a) => ({
                ...a,
                version: 1,
                serialNumber: `WH-${a.id}`,
                notes: 'Seeded inventory record.',
                requestId: null,
                history: [
                    {
                        id: `H-SEED-${a.id}`,
                        action: 'seeded',
                        actorId: 'P013',
                        occurredAt: '2026-01-01T00:00:00.000Z',
                        note: `Initial demo record (${a.status}).`,
                    },
                ],
            })),
        });
    }

    private actor(identity: DemoIdentity): void {
        requireRule(
            DEMO_IDENTITIES.some(
                (a) =>
                    a.personId === identity.personId &&
                    a.role === identity.role &&
                    a.teamId === identity.teamId,
            ),
            403,
            'This demo identity is unavailable.',
        );
    }

    private findRequest(id: string): RequestDetail {
        const record = this.data.requests.find((r) => r.id === id) as
            RequestDetail | undefined;
        requireRule(record, 404, 'This request does not exist.');
        return record;
    }

    private findAsset(id: string): AssetDetail {
        const record = this.data.assets.find((r) => r.id === id) as
            AssetDetail | undefined;
        requireRule(record, 404, 'This asset does not exist.');
        return record;
    }

    request(id: string, actor: DemoIdentity): RequestDetail {
        this.actor(actor);
        const record = this.findRequest(id);
        requireRule(
            canSeeRequest(record, actor),
            403,
            'This identity cannot read this request.',
        );
        return record;
    }

    asset(id: string, actor: DemoIdentity): AssetDetail {
        this.actor(actor);
        const record = this.findAsset(id);
        requireRule(
            canSeeAsset(record, actor, this.data.people),
            403,
            'This identity cannot read this asset.',
        );
        return record;
    }

    approvals(actor: DemoIdentity): readonly RequestDetail[] {
        this.actor(actor);
        requireRule(
            actor.role === 'manager',
            403,
            'Select the manager identity to review requests.',
        );
        return (this.data.requests as readonly RequestDetail[]).filter((r) =>
            canReviewRequest(r, actor),
        );
    }

    assignmentOptions(
        assetId: string,
        actor: DemoIdentity,
    ): readonly RequestDetail[] {
        this.actor(actor);
        requireRule(
            actor.role === 'administrator',
            403,
            'Only administrators can assign inventory.',
        );
        const asset = this.findAsset(assetId);
        if (asset.status !== 'available') return [];
        return (this.data.requests as readonly RequestDetail[]).filter(
            (r) => r.status === 'approved' && r.category === asset.type,
        );
    }

    private event(
        action: AuditEvent['action'],
        actor: DemoIdentity,
        note: string,
    ): AuditEvent {
        return {
            id: `H${String(++this.eventCounter).padStart(5, '0')}`,
            action,
            actorId: actor.personId,
            occurredAt: this.clock(),
            note,
        };
    }

    private put(request?: RequestDetail, asset?: AssetDetail): void {
        const replace = <T extends { id: string }>(
            records: readonly T[],
            record: T | undefined,
        ): readonly T[] =>
            record
                ? records.some((r) => r.id === record.id)
                    ? records.map((r) => (r.id === record.id ? record : r))
                    : [...records, record]
                : records;
        this.data = immutable({
            ...this.data,
            requests: replace(this.data.requests, request),
            assets: replace(this.data.assets, asset),
        });
    }

    createRequest(value: unknown, actor: DemoIdentity): RequestDetail {
        this.actor(actor);
        requireRule(
            actor.role === 'employee',
            403,
            'Only employees can create requests.',
        );
        const input = validateRequest(value);
        const history = [this.event('created', actor, 'Request created.')];
        if (input.status === 'submitted')
            history.push(
                this.event('submitted', actor, 'Sent for manager review.'),
            );
        const record: RequestDetail = {
            ...input,
            id: `R${String(++this.requestCounter).padStart(4, '0')}`,
            requesterId: actor.personId,
            teamId: actor.teamId,
            createdAt: history[0].occurredAt,
            version: 1,
            allocatedAssetId: null,
            history,
        };
        this.put(record);
        return record;
    }

    updateRequest(
        id: string,
        value: unknown,
        actor: DemoIdentity,
    ): RequestDetail {
        const current = this.request(id, actor);
        requireRule(
            canEditRequest(current, actor),
            403,
            'Only the employee owner can edit an equipment/software draft.',
        );
        const input = validateRequest(value);
        expectedVersion(commandBody(value)['version'], current.version);
        const history = [
            ...current.history,
            this.event('updated', actor, 'Draft details updated.'),
        ];
        if (input.status === 'submitted')
            history.push(
                this.event('submitted', actor, 'Sent for manager review.'),
            );
        const record = {
            ...current,
            ...input,
            version: current.version + 1,
            history,
        };
        this.put(record);
        return record;
    }

    decide(id: string, value: unknown, actor: DemoIdentity): RequestDetail {
        const current = this.request(id, actor);
        requireRule(
            actor.role === 'manager' &&
                actor.teamId === current.teamId &&
                actor.personId !== current.requesterId,
            403,
            'Only another team manager can review this request.',
        );
        const input = validateDecision(value);
        expectedVersion(input.version, current.version);
        requireRule(
            current.status === 'submitted',
            409,
            'This request is no longer awaiting review.',
        );
        const status =
            input.decision === 'approve'
                ? ('approved' as const)
                : ('rejected' as const);
        const record = {
            ...current,
            status,
            version: current.version + 1,
            history: [
                ...current.history,
                this.event(
                    status,
                    actor,
                    input.reason || 'Approved for fulfillment.',
                ),
            ],
        };
        this.put(record);
        return record;
    }

    createAsset(value: unknown, actor: DemoIdentity): AssetDetail {
        this.actor(actor);
        requireRule(
            actor.role === 'administrator',
            403,
            'Only administrators can create inventory.',
        );
        const input = validateAsset(value);
        requireRule(
            this.data.suppliers.some((s) => s.id === input.supplierId),
            400,
            'Choose an existing supplier.',
        );
        const record: AssetDetail = {
            ...input,
            id: `A${String(++this.assetCounter).padStart(4, '0')}`,
            status: 'available',
            assigneeId: null,
            version: 1,
            requestId: null,
            history: [
                this.event('created', actor, 'Available inventory created.'),
            ],
        };
        this.put(undefined, record);
        return record;
    }

    assign(id: string, value: unknown, actor: DemoIdentity): Allocation {
        this.actor(actor);
        requireRule(
            actor.role === 'administrator',
            403,
            'Only administrators can assign inventory.',
        );
        const input = commandBody(value);
        requireRule(
            typeof input['requestId'] === 'string',
            400,
            'Choose an approved request.',
        );
        const asset = this.findAsset(id),
            request = this.findRequest(input['requestId']);
        expectedVersion(input['assetVersion'], asset.version);
        expectedVersion(input['requestVersion'], request.version);
        requireRule(
            asset.status === 'available' &&
                request.status === 'approved' &&
                asset.type === request.category &&
                !request.allocatedAssetId,
            409,
            'Choose a compatible available asset and an unfulfilled approved request.',
        );
        const allocatedAsset: AssetDetail = {
            ...asset,
            status: 'assigned',
            assigneeId: request.requesterId,
            requestId: request.id,
            version: asset.version + 1,
            history: [
                ...asset.history,
                this.event(
                    'assigned',
                    actor,
                    `Assigned for request ${request.id}.`,
                ),
            ],
        };
        const fulfilledRequest: RequestDetail = {
            ...request,
            status: 'fulfilled',
            allocatedAssetId: asset.id,
            version: request.version + 1,
            history: [
                ...request.history,
                this.event(
                    'assigned',
                    actor,
                    `Fulfilled with asset ${asset.id}.`,
                ),
            ],
        };
        this.put(fulfilledRequest, allocatedAsset);
        return { asset: allocatedAsset, request: fulfilledRequest };
    }
}
