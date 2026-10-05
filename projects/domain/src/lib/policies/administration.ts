import {
    PolicyInput,
    PurchasingPolicy,
    SupplierInput,
} from '../models/administration';
import { RequestInput, requestTotal } from '../models/workflow';
import { commandBody, requireRule } from './workflow';

function text(
    value: unknown,
    label: string,
    minimum: number,
    maximum: number,
): string {
    requireRule(typeof value === 'string', 400, `${label} must be text.`);
    const result = value.trim();
    requireRule(
        result.length >= minimum && result.length <= maximum,
        400,
        `${label} must contain ${minimum}–${maximum} characters.`,
    );
    return result;
}

export function validateSupplier(value: unknown): SupplierInput {
    const input = commandBody(value);
    const email = text(input['email'], 'Email', 3, 160);
    requireRule(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        400,
        'Enter a valid contact email.',
    );
    return {
        name: text(input['name'], 'Supplier name', 3, 100),
        contactName: text(input['contactName'], 'Contact name', 3, 100),
        email,
        phone: text(input['phone'] ?? '', 'Phone', 0, 40),
        notes: text(input['notes'] ?? '', 'Notes', 0, 1000),
    };
}

export function validatePolicy(value: unknown): PolicyInput {
    const input = commandBody(value);
    const category = input['category'];
    requireRule(
        category === 'equipment' ||
            category === 'software' ||
            category === 'service',
        400,
        'Choose a supported request category.',
    );
    const maximumTotal = input['maximumTotal'];
    requireRule(
        typeof maximumTotal === 'number' &&
            Number.isFinite(maximumTotal) &&
            maximumTotal >= 0.01 &&
            maximumTotal <= 10000000 &&
            Math.abs(maximumTotal * 100 - Math.round(maximumTotal * 100)) <
                1e-6,
        400,
        'Maximum total must be 0.01–10,000,000 with at most two decimals.',
    );
    requireRule(
        typeof input['enabled'] === 'boolean',
        400,
        'Enabled must be a boolean.',
    );
    return {
        name: text(input['name'], 'Policy name', 3, 100),
        category,
        maximumTotal,
        enabled: input['enabled'],
        notes: text(input['notes'] ?? '', 'Notes', 0, 1000),
    };
}

export function enforcePurchasingPolicies(
    request: RequestInput,
    policies: readonly PurchasingPolicy[],
): void {
    if (request.status !== 'submitted') return;
    const policy = policies
        .filter((p) => p.enabled && p.category === request.category)
        .sort((a, b) => a.maximumTotal - b.maximumTotal)[0];
    requireRule(
        !policy || requestTotal(request.items) <= policy.maximumTotal,
        400,
        policy
            ? `Policy "${policy.name}" limits ${request.category} submissions to €${policy.maximumTotal.toFixed(2)}. Save a draft or revise the estimate.`
            : 'Purchasing limit exceeded.',
    );
}
