import { MockRepository } from './mock-repository';
import { DEMO_IDENTITIES } from './seed-data';
import { WorkflowError } from 'domain';

const [employee, manager, admin] = DEMO_IDENTITIES;
const supplier = {
    name: 'Nordic Devices',
    contactName: 'Dana Smith',
    email: 'dana@nordic.example',
    phone: '',
    notes: '',
};
const request = {
    title: 'Laptop request',
    justification: 'Replacement for daily engineering work',
    category: 'equipment',
    delivery: { location: 'Helsinki', neededBy: '2026-12-01' },
    items: [{ description: 'Laptop', quantity: 1, unitCost: 250 }],
    status: 'submitted',
};

function rejects(action: () => unknown, status: number): void {
    try {
        action();
        throw new Error('Expected rejection');
    } catch (error) {
        expect(error).toBeInstanceOf(WorkflowError);
        expect((error as WorkflowError).status).toBe(status);
    }
}

describe('immutable supplier and purchasing-policy repository', () => {
    let repo: MockRepository;
    beforeEach(() => (repo = new MockRepository()));

    it('seeds contacts, linked assets and three immutable policies', () => {
        expect(repo.suppliers(admin)).toHaveLength(40);
        expect(repo.supplier('S001', admin).assets).toHaveLength(50);
        expect(Object.isFrozen(repo.supplier('S001', admin).supplier)).toBe(
            true,
        );
        expect(Object.isFrozen(repo.policies(admin))).toBe(true);
        expect(repo.policies(admin)).toHaveLength(3);
    });

    it.each([employee, manager, { ...admin, personId: 'unknown' }])(
        'denies contacts and policy administration to unauthorized identities',
        (actor) => {
            rejects(() => repo.suppliers(actor), 403);
            rejects(() => repo.createSupplier(supplier, actor), 403);
            rejects(() => repo.policies(actor), 403);
            rejects(
                () =>
                    repo.updatePolicy(
                        'POL-equipment',
                        {
                            ...repo.policy('POL-equipment', admin),
                            maximumTotal: 100,
                        },
                        actor,
                    ),
                403,
            );
        },
    );

    it('creates and updates one supplier with a stable ID and new version', () => {
        const created = repo.createSupplier(supplier, admin);
        expect(created).toMatchObject({ id: 'S041', version: 1 });
        const updated = repo.updateSupplier(
            created.id,
            { ...created, email: 'new@nordic.example' },
            admin,
        );
        expect(updated).toMatchObject({
            id: 'S041',
            version: 2,
            email: 'new@nordic.example',
        });
        expect(created.email).toBe(supplier.email);
        expect(repo.data.suppliers).toHaveLength(41);
        expect(
            repo.supplierOptions(employee).find((s) => s.id === 'S041'),
        ).toEqual({ id: 'S041', name: supplier.name });
    });

    it('rejects duplicates, stale versions, invalid commands and missing IDs atomically', () => {
        const created = repo.createSupplier(supplier, admin),
            before = repo.data;
        rejects(
            () =>
                repo.createSupplier(
                    { ...supplier, name: '  NORDIC DEVICES ' },
                    admin,
                ),
            409,
        );
        rejects(
            () =>
                repo.updateSupplier(
                    created.id,
                    { ...created, version: 2 },
                    admin,
                ),
            409,
        );
        rejects(
            () =>
                repo.updateSupplier(
                    created.id,
                    { ...created, email: 'bad' },
                    admin,
                ),
            400,
        );
        rejects(() => repo.supplier('missing', admin), 404);
        rejects(() => repo.policy('missing', admin), 404);
        expect(repo.data).toBe(before);
    });

    it('applies limits on create/submission while retaining allowed drafts', () => {
        const original = repo.policy('POL-equipment', admin);
        const policy = repo.updatePolicy(
            original.id,
            { ...original, maximumTotal: 100 },
            admin,
        );
        const before = repo.data;
        rejects(() => repo.createRequest(request, employee), 400);
        expect(repo.data).toBe(before);
        const draft = repo.createRequest(
            { ...request, status: 'draft' },
            employee,
        );
        rejects(
            () =>
                repo.updateRequest(
                    draft.id,
                    { ...request, version: draft.version },
                    employee,
                ),
            400,
        );
        expect(repo.request(draft.id, employee).status).toBe('draft');
        repo.updatePolicy(policy.id, { ...policy, enabled: false }, admin);
        expect(
            repo.updateRequest(
                draft.id,
                { ...request, version: draft.version },
                employee,
            ).status,
        ).toBe('submitted');
    });

    it('rejects stale policy updates and restores deterministic supplier/policy state', () => {
        const original = repo.policy('POL-equipment', admin);
        repo.updatePolicy(
            original.id,
            { ...original, maximumTotal: 123 },
            admin,
        );
        rejects(() => repo.updatePolicy(original.id, original, admin), 409);
        repo.createSupplier(supplier, admin);
        repo.reset();
        expect(repo.suppliers(admin)).toHaveLength(40);
        expect(repo.policy(original.id, admin)).toEqual(original);
        expect(repo.createSupplier(supplier, admin).id).toBe('S041');
    });
    it('checks draft permissions and versions before configured budget validation', () => {
        const policy = repo.policy('POL-equipment', admin);
        repo.updatePolicy(policy.id, { ...policy, maximumTotal: 100 }, admin);
        const draft = repo.createRequest(
            { ...request, status: 'draft' },
            employee,
        );
        rejects(
            () =>
                repo.updateRequest(
                    draft.id,
                    { ...request, version: draft.version },
                    manager,
                ),
            403,
        );
        rejects(
            () =>
                repo.updateRequest(
                    draft.id,
                    { ...request, version: draft.version + 1 },
                    employee,
                ),
            409,
        );
        expect(repo.request(draft.id, employee).status).toBe('draft');
    });
});
