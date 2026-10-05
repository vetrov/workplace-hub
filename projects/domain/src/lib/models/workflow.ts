import {
    AssetSummary,
    DemoIdentity,
    RequestCategory,
    RequestSummary,
} from './foundation';

export const WORKFLOW_LIMITS = {
    title: 100,
    justification: 2000,
    location: 120,
    itemDescription: 120,
    items: 10,
    quantity: 100,
    unitCost: 100000,
    serial: 80,
    notes: 1000,
    reason: 500,
} as const;

export interface RequestLine {
    description: string;
    quantity: number;
    unitCost: number;
}

export interface Delivery {
    location: string;
    neededBy: string;
}

export interface RequestInput {
    title: string;
    justification: string;
    category: RequestCategory;
    delivery: Delivery;
    items: RequestLine[];
    status: 'draft' | 'submitted';
}

export interface AuditEvent {
    readonly id: string;
    readonly action:
        | 'seeded'
        | 'created'
        | 'updated'
        | 'submitted'
        | 'approved'
        | 'rejected'
        | 'assigned';
    readonly actorId: string;
    readonly occurredAt: string;
    readonly note: string;
}

export interface RequestDetail extends RequestSummary {
    readonly version: number;
    readonly justification: string;
    readonly delivery: Delivery;
    readonly items: readonly RequestLine[];
    readonly allocatedAssetId: string | null;
    readonly history: readonly AuditEvent[];
}

export interface AssetDetail extends AssetSummary {
    readonly version: number;
    readonly serialNumber: string;
    readonly notes: string;
    readonly requestId: string | null;
    readonly history: readonly AuditEvent[];
}

export interface AssetInput {
    name: string;
    type: 'equipment' | 'software';
    supplierId: string;
    serialNumber: string;
    notes: string;
}

export interface DecisionInput {
    decision: 'approve' | 'reject';
    reason: string;
    version: number;
}

export interface AssignmentInput {
    requestId: string;
    requestVersion: number;
    assetVersion: number;
}

export interface RecordResult<T> {
    readonly record: T;
    readonly contextKey: string;
}

export interface CollectionResult<T> {
    readonly items: readonly T[];
    readonly contextKey: string;
}

export interface Allocation {
    readonly request: RequestDetail;
    readonly asset: AssetDetail;
}

export interface WorkflowStore {
    request(id: string, actor: DemoIdentity): RequestDetail;
    asset(id: string, actor: DemoIdentity): AssetDetail;
    approvals(actor: DemoIdentity): readonly RequestDetail[];
    assignmentOptions(
        assetId: string,
        actor: DemoIdentity,
    ): readonly RequestDetail[];
    createRequest(input: unknown, actor: DemoIdentity): RequestDetail;
    updateRequest(
        id: string,
        input: unknown,
        actor: DemoIdentity,
    ): RequestDetail;
    decide(id: string, input: unknown, actor: DemoIdentity): RequestDetail;
    createAsset(input: unknown, actor: DemoIdentity): AssetDetail;
    assign(id: string, input: unknown, actor: DemoIdentity): Allocation;
}

export function requestTotal(items: readonly RequestLine[]): number {
    return (
        items.reduce(
            (cents, item) =>
                cents + Math.round(item.unitCost * 100) * item.quantity,
            0,
        ) / 100
    );
}
