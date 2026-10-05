import { RequestInput, WorkflowStore } from 'domain';
import { MockRepository } from './mock-repository';
import { DEMO_IDENTITIES } from './seed-data';

export const validRequest = (): RequestInput => ({
    title: 'Development laptop',
    justification: 'Replace an unreliable laptop for daily work.',
    category: 'equipment',
    delivery: { location: 'Helsinki office', neededBy: '2026-12-01' },
    items: [{ description: 'Laptop computer', quantity: 1, unitCost: 1299.95 }],
    status: 'draft',
});

const [employee, manager, admin] = DEMO_IDENTITIES;

describe('request-to-asset command invariants', () => {
    let original: MockRepository;
    let repo: WorkflowStore;
    beforeEach(() => {
        original = new MockRepository();
        repo = original as unknown as WorkflowStore;
    });
    it('creates owned drafts, edits, submits, approves and atomically fulfills with linked history', () => {
        const draft = repo.createRequest(validRequest(), employee);
        expect(draft).toMatchObject({
            id: 'R0251',
            status: 'draft',
            requesterId: employee.personId,
            version: 1,
        });
        const submitted = repo.updateRequest(
            draft.id,
            { ...validRequest(), status: 'submitted', version: 1 },
            employee,
        );
        expect(submitted.history.map((e) => e.action)).toEqual([
            'created',
            'updated',
            'submitted',
        ]);
        const approved = repo.decide(
            draft.id,
            {
                decision: 'approve',
                reason: 'Needed for work',
                version: submitted.version,
            },
            manager,
        );
        const asset = repo.createAsset(
            {
                name: 'Demo laptop',
                type: 'equipment',
                supplierId: 'S001',
                serialNumber: 'TEST-001',
                notes: '',
            },
            admin,
        );
        const result = repo.assign(
            asset.id,
            {
                requestId: draft.id,
                requestVersion: approved.version,
                assetVersion: asset.version,
            },
            admin,
        );
        expect(result.request).toMatchObject({
            status: 'fulfilled',
            allocatedAssetId: asset.id,
        });
        expect(result.asset).toMatchObject({
            status: 'assigned',
            assigneeId: employee.personId,
            requestId: draft.id,
        });
        expect(result.request.history.at(-1)).toMatchObject({
            action: 'assigned',
            actorId: admin.personId,
        });
        expect(result.asset.history.at(-1)?.note).toContain(draft.id);
    });
    it.each([
        { title: '  ' },
        { justification: 'short' },
        { category: 'service' },
        { delivery: { location: 'HQ', neededBy: '2026-02-30' } },
        { items: [] },
        { items: [{ description: 'Laptop', quantity: 0, unitCost: 10 }] },
        { items: [{ description: 'Laptop', quantity: 1.5, unitCost: 10 }] },
        { items: [{ description: 'Laptop', quantity: 1, unitCost: 1.001 }] },
        {
            items: [
                { description: 'Laptop', quantity: 1, unitCost: Number.NaN },
            ],
        },
    ])(
        'rejects malformed request fields without records or history: %j',
        (invalid) => {
            const before = JSON.stringify(original.data);
            expect(() =>
                repo.createRequest({ ...validRequest(), ...invalid }, employee),
            ).toThrow();
            expect(JSON.stringify(original.data)).toBe(before);
        },
    );
    it('enforces actor scope, draft ownership, manager team and no self approval', () => {
        expect(() => repo.createRequest(validRequest(), admin)).toThrow();
        const draft = repo.createRequest(validRequest(), employee);
        expect(() =>
            repo.updateRequest(
                draft.id,
                { ...validRequest(), version: 1 },
                manager,
            ),
        ).toThrow();
        const submitted = repo.updateRequest(
            draft.id,
            { ...validRequest(), status: 'submitted', version: 1 },
            employee,
        );
        expect(() =>
            repo.decide(
                draft.id,
                { decision: 'approve', reason: '', version: submitted.version },
                admin,
            ),
        ).toThrow();
        expect(
            repo
                .approvals(manager)
                .every(
                    (r) =>
                        r.status === 'submitted' &&
                        r.teamId === manager.teamId &&
                        r.requesterId !== manager.personId,
                ),
        ).toBe(true);
        expect(() => repo.request('R0002', employee)).toThrow();
        const ownSubmitted = original.data.requests.find(
            (r) =>
                r.requesterId === manager.personId && r.status === 'submitted',
        );
        expect(ownSubmitted).toBeDefined();
        expect(() =>
            repo.decide(
                ownSubmitted!.id,
                { decision: 'approve', reason: '', version: 1 },
                manager,
            ),
        ).toThrow();
    });
    it('requires rejection reasons and rejects stale/repeated decisions without extra events', () => {
        const request = repo.createRequest(
            { ...validRequest(), status: 'submitted' },
            employee,
        );
        expect(() =>
            repo.decide(
                request.id,
                { decision: 'reject', reason: ' ', version: 1 },
                manager,
            ),
        ).toThrow();
        const rejected = repo.decide(
            request.id,
            { decision: 'reject', reason: 'Budget exceeded', version: 1 },
            manager,
        );
        expect(rejected).toMatchObject({ status: 'rejected', version: 2 });
        expect(rejected.history.at(-1)?.note).toBe('Budget exceeded');
        expect(() =>
            repo.decide(
                request.id,
                { decision: 'approve', reason: '', version: 1 },
                manager,
            ),
        ).toThrow();
        expect(repo.request(request.id, employee).history).toHaveLength(
            rejected.history.length,
        );
    });
    it('rejects incompatible/stale/duplicate allocation without changing either side', () => {
        const submitted = repo.createRequest(
            { ...validRequest(), status: 'submitted' },
            employee,
        );
        const request = repo.decide(
            submitted.id,
            { decision: 'approve', reason: '', version: 1 },
            manager,
        );
        const software = repo.createAsset(
            {
                name: 'License',
                type: 'software',
                supplierId: 'S001',
                serialNumber: 'LIC-1',
                notes: '',
            },
            admin,
        );
        const before = JSON.stringify(original.data);
        expect(() =>
            repo.assign(
                software.id,
                {
                    requestId: request.id,
                    requestVersion: request.version,
                    assetVersion: 1,
                },
                admin,
            ),
        ).toThrow();
        expect(JSON.stringify(original.data)).toBe(before);
        const available = original.data.assets.find(
            (a) => a.status === 'available' && a.type === 'equipment',
        )!;
        expect(() =>
            repo.assign(
                available.id,
                { requestId: request.id, requestVersion: 999, assetVersion: 1 },
                admin,
            ),
        ).toThrow();
        expect(() =>
            repo.assign(
                available.id,
                {
                    requestId: request.id,
                    requestVersion: request.version,
                    assetVersion: 1,
                },
                employee,
            ),
        ).toThrow();
        const allocated = repo.assign(
            available.id,
            {
                requestId: request.id,
                requestVersion: request.version,
                assetVersion: 1,
            },
            admin,
        );
        expect(() =>
            repo.assign(
                available.id,
                {
                    requestId: request.id,
                    requestVersion: request.version,
                    assetVersion: 1,
                },
                admin,
            ),
        ).toThrow();
        expect(repo.asset(available.id, admin).history).toEqual(
            allocated.asset.history,
        );
    });
    it('validates inventory and recreates detail/history/ID counters on reset', () => {
        expect(() =>
            repo.createAsset(
                {
                    name: 'Laptop',
                    type: 'equipment',
                    supplierId: 'missing',
                    serialNumber: 'SN1',
                    notes: '',
                },
                admin,
            ),
        ).toThrow();
        const originalHistory = repo.request('R0025', employee).history;
        repo.createRequest(validRequest(), employee);
        original.reset();
        expect(original.data.requests).toHaveLength(250);
        expect(repo.request('R0025', employee).history).toEqual(
            originalHistory,
        );
        expect(repo.createRequest(validRequest(), employee).id).toBe('R0251');
    });
});
