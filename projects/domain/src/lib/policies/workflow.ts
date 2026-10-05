import { DemoIdentity } from '../models/foundation';
import {
  AssetInput,
  DecisionInput,
  RequestDetail,
  RequestInput,
  WORKFLOW_LIMITS,
} from '../models/workflow';

export class WorkflowError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireRule(
  condition: unknown,
  status: number,
  message: string,
): asserts condition {
  if (!condition) throw new WorkflowError(status, message);
}
export function commandBody(value: unknown): Record<string, unknown> {
  requireRule(
    value !== null && typeof value === 'object' && !Array.isArray(value),
    400,
    'A command body is required.',
  );
  return value as Record<string, unknown>;
}
function text(value: unknown, name: string, min: number, max: number): string {
  requireRule(typeof value === 'string', 400, `${name} must be text.`);
  const result = value.trim();
  requireRule(
    result.length >= min && result.length <= max,
    400,
    `${name} must contain ${min}–${max} characters.`,
  );
  return result;
}
export function validCalendarDate(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function validateRequest(value: unknown): RequestInput {
  const input = commandBody(value),
    delivery = commandBody(input['delivery']);
  requireRule(
    input['category'] === 'equipment' || input['category'] === 'software',
    400,
    'Choose equipment or software.',
  );
  requireRule(
    input['status'] === 'draft' || input['status'] === 'submitted',
    400,
    'Choose draft or submitted.',
  );
  requireRule(validCalendarDate(delivery['neededBy']), 400, 'Choose a valid delivery date.');
  const rows = input['items'];
  requireRule(
    Array.isArray(rows) && rows.length >= 1 && rows.length <= WORKFLOW_LIMITS.items,
    400,
    'Add between 1 and 10 items.',
  );
  const items = rows.map((value) => {
    const row = commandBody(value),
      quantity = row['quantity'],
      cost = row['unitCost'];
    requireRule(
      typeof quantity === 'number' &&
        Number.isInteger(quantity) &&
        quantity >= 1 &&
        quantity <= WORKFLOW_LIMITS.quantity,
      400,
      'Quantity must be an integer from 1 to 100.',
    );
    requireRule(
      typeof cost === 'number' &&
        Number.isFinite(cost) &&
        cost >= 0.01 &&
        cost <= WORKFLOW_LIMITS.unitCost &&
        Math.abs(cost * 100 - Math.round(cost * 100)) < 1e-6,
      400,
      'Unit cost must be 0.01–100,000 with at most two decimals.',
    );
    return {
      description: text(row['description'], 'Item description', 3, WORKFLOW_LIMITS.itemDescription),
      quantity,
      unitCost: cost,
    };
  });
  return {
    title: text(input['title'], 'Title', 3, WORKFLOW_LIMITS.title),
    justification: text(input['justification'], 'Justification', 10, WORKFLOW_LIMITS.justification),
    category: input['category'],
    status: input['status'],
    delivery: {
      location: text(delivery['location'], 'Location', 3, WORKFLOW_LIMITS.location),
      neededBy: delivery['neededBy'] as string,
    },
    items,
  };
}
export function validateAsset(value: unknown): AssetInput {
  const body = commandBody(value);
  requireRule(
    body['type'] === 'equipment' || body['type'] === 'software',
    400,
    'Choose equipment or software.',
  );
  return {
    name: text(body['name'], 'Asset name', 3, WORKFLOW_LIMITS.title),
    type: body['type'],
    supplierId: text(body['supplierId'], 'Supplier', 1, 100),
    serialNumber: text(
      body['serialNumber'],
      'Serial or license identifier',
      3,
      WORKFLOW_LIMITS.serial,
    ),
    notes: text(body['notes'], 'Notes', 0, WORKFLOW_LIMITS.notes),
  };
}
export function expectedVersion(value: unknown, current: number): void {
  requireRule(
    typeof value === 'number' && Number.isSafeInteger(value) && value > 0,
    400,
    'A valid record version is required.',
  );
  requireRule(value === current, 409, 'This record changed. Reload it before trying again.');
}
export function validateDecision(value: unknown): DecisionInput {
  const body = commandBody(value);
  requireRule(
    body['decision'] === 'approve' || body['decision'] === 'reject',
    400,
    'Choose approve or reject.',
  );
  return {
    decision: body['decision'],
    reason: text(
      body['reason'],
      'Reason',
      body['decision'] === 'reject' ? 3 : 0,
      WORKFLOW_LIMITS.reason,
    ),
    version: body['version'] as number,
  };
}
export function canEditRequest(request: RequestDetail, actor: DemoIdentity): boolean {
  return (
    actor.role === 'employee' &&
    request.requesterId === actor.personId &&
    request.status === 'draft' &&
    request.category !== 'service'
  );
}
export function canReviewRequest(request: RequestDetail, actor: DemoIdentity): boolean {
  return (
    actor.role === 'manager' &&
    request.teamId === actor.teamId &&
    request.requesterId !== actor.personId &&
    request.status === 'submitted'
  );
}
