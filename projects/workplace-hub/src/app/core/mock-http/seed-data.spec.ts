import { createSeedData, DEMO_IDENTITIES } from './seed-data';

describe('deterministic business records', () => {
    it('has fixed counts and identical independent resets', () => {
        const first = createSeedData(),
            second = createSeedData();
        expect([
            first.people.length,
            first.teams.length,
            first.suppliers.length,
            first.requests.length,
            first.assets.length,
        ]).toEqual([80, 12, 40, 250, 2000]);
        expect(second).toEqual(first);
        expect(second.requests).not.toBe(first.requests);
        expect(Object.isFrozen(first.requests[0])).toBe(true);
    });

    it('keeps all relationships valid and each identity supplied with records', () => {
        const data = createSeedData();
        const person = new Map(data.people.map((p) => [p.id, p]));
        const teams = new Map(data.teams.map((t) => [t.id, t]));
        const suppliers = new Set(data.suppliers.map((s) => s.id));
        for (const records of Object.values(data))
            expect(
                new Set(
                    records.map((record: { readonly id: string }) => record.id),
                ).size,
            ).toBe(records.length);
        for (const p of data.people) {
            expect(teams.has(p.teamId)).toBe(true);
            expect(p.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
        }
        for (const team of data.teams)
            expect(person.get(team.managerId)?.teamId).toBe(team.id);
        for (const r of data.requests) {
            expect(person.get(r.requesterId)?.teamId).toBe(r.teamId);
            expect(Number.isNaN(Date.parse(r.createdAt))).toBe(false);
        }
        for (const a of data.assets) {
            expect(suppliers.has(a.supplierId)).toBe(true);
            expect(
                a.status === 'assigned'
                    ? person.has(a.assigneeId!)
                    : a.assigneeId === null,
            ).toBe(true);
        }
        for (const identity of DEMO_IDENTITIES) {
            expect(
                data.requests.some((r) => r.requesterId === identity.personId),
            ).toBe(true);
            expect(
                data.assets.some((a) => a.assigneeId === identity.personId),
            ).toBe(true);
            expect(person.get(identity.personId)?.teamId).toBe(identity.teamId);
        }
    });
});
