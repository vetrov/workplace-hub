import {
    AdministrationStore,
    DemoIdentity,
    Supplier,
    SupplierDetail,
    SupplierView,
    PurchasingPolicy,
    RequestDetail,
    commandBody,
    canEditRequest,
    expectedVersion,
    requireRule,
    validateSupplier,
    validatePolicy,
    validateRequest,
    enforcePurchasingPolicies,
} from 'domain';
import { WorkflowRepository } from './workflow-repository';
import { DEMO_IDENTITIES } from './seed-data';

function immutable<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(immutable);
        Object.freeze(value);
    }
    return value;
}

export class AdministrationRepository
    extends WorkflowRepository
    implements AdministrationStore
{
    private supplierCounter = 40;
    private policyRecords: readonly PurchasingPolicy[] = [];

    constructor() {
        super();
        this.reset();
    }

    override reset(): void {
        super.reset();
        this.supplierCounter = 40;
        this.data = immutable({
            ...this.data,
            suppliers: this.data.suppliers.map((supplier, index) => ({
                ...supplier,
                contactName: `Supplier contact ${index + 1}`,
                email: `contact${index + 1}@supplier.example`,
                phone: '',
                notes: 'Seeded procurement partner.',
                version: 1,
            })),
        });
        this.policyRecords = immutable(
            (['equipment', 'software', 'service'] as const).map((category) => ({
                id: `POL-${category}`,
                name: `${category[0].toUpperCase() + category.slice(1)} purchasing limit`,
                category,
                maximumTotal: 50000,
                enabled: true,
                notes: 'Applies to future submitted requests; existing decisions are unchanged.',
                version: 1,
            })),
        );
    }

    private knownActor(actor: DemoIdentity): void {
        requireRule(
            DEMO_IDENTITIES.some(
                (a) =>
                    a.personId === actor.personId &&
                    a.role === actor.role &&
                    a.teamId === actor.teamId,
            ),
            403,
            'This demo identity is unavailable.',
        );
    }

    private administrator(actor: DemoIdentity): void {
        this.knownActor(actor);
        requireRule(
            actor.role === 'administrator',
            403,
            'Only administrators can manage suppliers and purchasing policies.',
        );
    }

    suppliers(actor: DemoIdentity): readonly SupplierDetail[] {
        this.administrator(actor);
        return this.data.suppliers as readonly SupplierDetail[];
    }

    supplier(id: string, actor: DemoIdentity): SupplierView {
        const supplier = this.suppliers(actor).find((s) => s.id === id);
        requireRule(supplier, 404, 'This supplier does not exist.');
        return {
            supplier,
            assets: this.data.assets.filter((a) => a.supplierId === id),
        };
    }

    supplierOptions(actor: DemoIdentity): readonly Supplier[] {
        this.knownActor(actor);
        return this.data.suppliers.map(({ id, name }) => ({ id, name }));
    }

    private uniqueName(name: string, id?: string): void {
        requireRule(
            !this.data.suppliers.some(
                (s) =>
                    s.id !== id && s.name.toLowerCase() === name.toLowerCase(),
            ),
            409,
            'A supplier with this name already exists.',
        );
    }

    createSupplier(value: unknown, actor: DemoIdentity): SupplierDetail {
        this.administrator(actor);
        const input = validateSupplier(value);
        this.uniqueName(input.name);
        const record = immutable({
            ...input,
            id: `S${String(++this.supplierCounter).padStart(3, '0')}`,
            version: 1,
        });
        this.data = immutable({
            ...this.data,
            suppliers: [...this.data.suppliers, record],
        });
        return record;
    }

    updateSupplier(
        id: string,
        value: unknown,
        actor: DemoIdentity,
    ): SupplierDetail {
        const current = this.supplier(id, actor).supplier;
        const body = commandBody(value);
        expectedVersion(body['version'], current.version);
        const input = validateSupplier(body);
        this.uniqueName(input.name, id);
        const record = immutable({
            ...input,
            id,
            version: current.version + 1,
        });
        this.data = immutable({
            ...this.data,
            suppliers: this.data.suppliers.map((s) =>
                s.id === id ? record : s,
            ),
        });
        return record;
    }

    policies(actor: DemoIdentity): readonly PurchasingPolicy[] {
        this.administrator(actor);
        return this.policyRecords;
    }

    policy(id: string, actor: DemoIdentity): PurchasingPolicy {
        const policy = this.policies(actor).find((p) => p.id === id);
        requireRule(policy, 404, 'This purchasing policy does not exist.');
        return policy;
    }

    updatePolicy(
        id: string,
        value: unknown,
        actor: DemoIdentity,
    ): PurchasingPolicy {
        const current = this.policy(id, actor),
            body = commandBody(value);
        expectedVersion(body['version'], current.version);
        const input = validatePolicy(body);
        const record = immutable({
            ...input,
            id,
            version: current.version + 1,
        });
        this.policyRecords = immutable(
            this.policyRecords.map((p) => (p.id === id ? record : p)),
        );
        return record;
    }

    override createRequest(value: unknown, actor: DemoIdentity): RequestDetail {
        this.knownActor(actor);
        requireRule(
            actor.role === 'employee',
            403,
            'Only employees can create requests.',
        );
        enforcePurchasingPolicies(validateRequest(value), this.policyRecords);
        return super.createRequest(value, actor);
    }

    override updateRequest(
        id: string,
        value: unknown,
        actor: DemoIdentity,
    ): RequestDetail {
        const current = this.request(id, actor);
        requireRule(
            canEditRequest(current, actor),
            403,
            'Only the owning employee can edit this draft.',
        );
        expectedVersion(commandBody(value)['version'], current.version);
        enforcePurchasingPolicies(validateRequest(value), this.policyRecords);
        return super.updateRequest(id, value, actor);
    }
}
