import { describe, expect, it } from 'vitest';
import {
    validateSupplier,
    validatePolicy,
    enforcePurchasingPolicies,
    RequestInput,
    PurchasingPolicy,
} from 'domain';

const supplier = {
    name: 'Nordic Devices',
    contactName: 'Dana Smith',
    email: 'dana@nordic.example',
    phone: '',
    notes: '',
};
const policy = {
    name: 'Equipment purchases',
    category: 'equipment' as const,
    maximumTotal: 100,
    enabled: true,
    notes: '',
};
const request: RequestInput = {
    title: 'Laptop request',
    justification: 'Required for engineering work',
    category: 'equipment',
    delivery: { location: 'Office', neededBy: '2026-12-01' },
    items: [{ description: 'Laptop', quantity: 1, unitCost: 250 }],
    status: 'submitted',
};
const policies: PurchasingPolicy[] = [
    { ...policy, id: 'POL-equipment', version: 1 },
];

describe('administration validation and purchasing policies', () => {
    it('normalizes contact whitespace and optional values', () => {
        expect(
            validateSupplier({
                ...supplier,
                name: '  Nordic Devices  ',
                email: ' dana@nordic.example ',
            }),
        ).toEqual(supplier);
    });

    it.each([
        null,
        { ...supplier, name: ' ' },
        { ...supplier, contactName: 'a' },
        { ...supplier, email: 'invalid' },
        { ...supplier, phone: 'x'.repeat(41) },
        { ...supplier, notes: 'x'.repeat(1001) },
    ])(
        'rejects malformed supplier contacts without accepting coerced values',
        (value) => {
            expect(() => validateSupplier(value)).toThrow();
        },
    );

    it.each([
        { ...policy, category: 'unknown' },
        { ...policy, name: '   ' },
        { ...policy, maximumTotal: NaN },
        { ...policy, maximumTotal: 0 },
        { ...policy, maximumTotal: 10000001 },
        { ...policy, maximumTotal: 1.001 },
        { ...policy, enabled: 'false' },
        { ...policy, notes: 'x'.repeat(1001) },
    ])('rejects malformed purchasing policy', (value) => {
        expect(() => validatePolicy(value)).toThrow();
    });

    it('allows exact-cent limits and normalizes policy text', () => {
        expect(
            validatePolicy({
                ...policy,
                name: '  Equipment purchases ',
                maximumTotal: 100.25,
            }),
        ).toEqual({ ...policy, maximumTotal: 100.25 });
    });

    it('rejects future submissions exceeding an enabled category policy', () => {
        expect(() => enforcePurchasingPolicies(request, policies)).toThrow(
            '€100.00',
        );
        expect(() =>
            enforcePurchasingPolicies(
                {
                    ...request,
                    items: [
                        { description: 'Laptop', quantity: 1, unitCost: 100 },
                    ],
                },
                policies,
            ),
        ).not.toThrow();
    });

    it('allows drafts and ignores disabled/unrelated categories', () => {
        expect(() =>
            enforcePurchasingPolicies(
                { ...request, status: 'draft' },
                policies,
            ),
        ).not.toThrow();
        expect(() =>
            enforcePurchasingPolicies(request, [
                { ...policies[0], enabled: false },
            ]),
        ).not.toThrow();
        expect(() =>
            enforcePurchasingPolicies(
                { ...request, category: 'software' },
                policies,
            ),
        ).not.toThrow();
    });

    it('uses the lowest applicable limit rather than policy ordering', () => {
        expect(() =>
            enforcePurchasingPolicies(request, [
                { ...policies[0], maximumTotal: 1000 },
                policies[0],
            ]),
        ).toThrow('€100.00');
    });
});
