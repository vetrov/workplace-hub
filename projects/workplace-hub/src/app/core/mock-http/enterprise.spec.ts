import { MockRepository } from './mock-repository';
import { DEMO_IDENTITIES } from './seed-data';
import { WorkflowError } from 'domain';

const [employee, manager, admin] = DEMO_IDENTITIES;
const definition = {
    name: 'Equipment report',
    dataset: 'assets',
    status: '',
    personId: '',
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

describe('enterprise relationships and authorization', () => {
    let repo: MockRepository;
    beforeEach(() => (repo = new MockRepository()));

    it('profiles contain only related work the actor can read', () => {
        expect(repo.people(employee)).toHaveLength(80);
        const other = repo.person('P002', employee);
        expect(other.requests).toHaveLength(0);
        expect(other.assets).toHaveLength(0);
        expect(
            repo.person(employee.personId, employee).requests.length,
        ).toBeGreaterThan(0);
        expect(repo.teams(manager).map((t) => t.id)).toEqual(['T001']);
        rejects(() => repo.team('T002', manager), 403);
        rejects(() => repo.teams(employee), 403);
    });

    it('transfers members immutably, advances both teams and keeps historical requests', () => {
        const before = repo.data,
            source = repo.team('T002', admin).team,
            target = repo.team('T001', admin).team;
        const result = repo.transfer(
            'T001',
            { personId: 'P026', fromTeamId: 'T002', version: target.version },
            admin,
        );
        expect(result.members.some((p) => p.id === 'P026')).toBe(true);
        expect(result.team.version).toBe(2);
        expect(repo.team('T002', admin).team.version).toBe(source.version + 1);
        expect(before.people.find((p) => p.id === 'P026')?.teamId).toBe('T002');
        expect(repo.person('P026', manager).assets.length).toBeGreaterThan(0);
        expect(
            repo.data.requests
                .filter((q) => q.requesterId === 'P026')
                .every((q) => q.teamId === 'T002'),
        ).toBe(true);
    });

    it('rejects protected, stale, wrong-source and unauthorized membership writes', () => {
        const before = repo.data;
        for (const personId of ['P001', 'P025', 'P013'])
            rejects(
                () =>
                    repo.transfer(
                        'T002',
                        { personId, fromTeamId: 'T001', version: 1 },
                        admin,
                    ),
                400,
            );
        rejects(
            () =>
                repo.transfer(
                    'T001',
                    { personId: 'P026', fromTeamId: 'T002', version: 2 },
                    admin,
                ),
            409,
        );
        rejects(
            () =>
                repo.transfer(
                    'T001',
                    { personId: 'P026', fromTeamId: 'T003', version: 1 },
                    admin,
                ),
            409,
        );
        rejects(
            () =>
                repo.transfer(
                    'T001',
                    { personId: 'P026', fromTeamId: 'T002', version: 1 },
                    manager,
                ),
            403,
        );
        expect(repo.data).toBe(before);
    });

    it('edits inventory with history and protects assigned allocation facts', () => {
        const available = repo.asset('A0001', admin);
        const changed = repo.updateAsset(
            available.id,
            { ...available, name: 'Updated device', status: 'maintenance' },
            admin,
        );
        expect(changed).toMatchObject({
            version: 2,
            status: 'maintenance',
            name: 'Updated device',
        });
        expect(changed.history.at(-1)?.action).toBe('updated');
        expect(repo.assignmentOptions(changed.id, admin)).toHaveLength(0);
        rejects(
            () =>
                repo.updateAsset(
                    available.id,
                    { ...available, status: 'available' },
                    admin,
                ),
            409,
        );
        const assigned = repo.asset('A0002', admin),
            before = repo.data;
        rejects(
            () =>
                repo.updateAsset(
                    assigned.id,
                    { ...assigned, status: 'available' },
                    admin,
                ),
            409,
        );
        rejects(
            () =>
                repo.updateAsset(
                    assigned.id,
                    {
                        ...assigned,
                        type:
                            assigned.type === 'equipment'
                                ? 'software'
                                : 'equipment',
                    },
                    admin,
                ),
            409,
        );
        expect(repo.data).toBe(before);
        const renamed = repo.updateAsset(
            assigned.id,
            { ...assigned, name: 'Tracked device' },
            admin,
        );
        expect(renamed.assigneeId).toBe(assigned.assigneeId);
        rejects(
            () => repo.updateAsset(assigned.id, { ...renamed }, employee),
            403,
        );
    });

    it('scopes saved definitions, runs and exports to the live actor', () => {
        expect(repo.reports(manager)).toHaveLength(2);
        expect(repo.reports(admin)).toHaveLength(4);
        const saved = repo.createReport(definition, manager),
            run = repo.report(saved.id, manager);
        expect(run.total).toBe(
            repo.data.assets.filter(
                (a) =>
                    a.assigneeId &&
                    repo.data.people.some(
                        (p) =>
                            p.id === a.assigneeId &&
                            p.teamId === manager.teamId,
                    ),
            ).length,
        );
        expect(run.buckets.reduce((sum, b) => sum + b.count, 0)).toBe(
            run.total,
        );
        expect(repo.report(saved.id, admin).total).toBe(2000);
        expect(repo.report(saved.id, admin).rows).toHaveLength(100);
        expect(repo.exportReport(saved.id, admin).split('\r\n')).toHaveLength(
            2001,
        );
        rejects(() => repo.report('REP003', manager), 403);
        rejects(() => repo.reports(employee), 403);
        rejects(
            () =>
                repo.createReport({ ...definition, personId: 'P002' }, manager),
            403,
        );
    });

    it('applies saved status/person filters and reflects later membership changes', () => {
        const saved = repo.createReport(
            { ...definition, status: 'assigned', personId: 'P026' },
            admin,
        );
        expect(
            repo
                .report(saved.id, admin)
                .rows.every(
                    (r) => r.personId === 'P026' && r.status === 'assigned',
                ),
        ).toBe(true);
        const team = repo.team('T001', admin).team;
        const managerSaved = repo.createReport(definition, manager),
            count = repo.report(managerSaved.id, manager).total;
        repo.transfer(
            team.id,
            { personId: 'P026', fromTeamId: 'T002', version: team.version },
            admin,
        );
        expect(repo.report(managerSaved.id, manager).total).toBeGreaterThan(
            count,
        );
    });

    it('enforces live role flags without changing demo base roles', () => {
        const roles = repo.roles(admin);
        repo.updateRoles(
            {
                ...roles,
                managerCanCreateReports: false,
                managerCanExportReports: false,
            },
            admin,
        );
        rejects(() => repo.createReport(definition, manager), 403);
        rejects(() => repo.exportReport('REP001', manager), 403);
        expect(repo.report('REP001', manager).report.ownerId).toBe(
            manager.personId,
        );
        expect(repo.createReport(definition, admin).id).toBe('REP005');
        rejects(() => repo.updateRoles(roles, admin), 409);
        rejects(() => repo.roles(manager), 403);
    });

    it('category updates affect future submissions only and reject duplicate labels', () => {
        const category = repo.categories(admin)[0];
        const disabled = repo.updateCategory(
            category.id,
            { ...category, enabled: false, label: 'Hardware' },
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
        rejects(
            () =>
                repo.updateCategory(
                    'software',
                    { label: 'hardware', enabled: true, version: 1 },
                    admin,
                ),
            409,
        );
        repo.updateCategory(disabled.id, { ...disabled, enabled: true }, admin);
        expect(
            repo.updateRequest(
                draft.id,
                { ...request, version: draft.version },
                employee,
            ).status,
        ).toBe('submitted');
    });

    it('settings/defaults and all enterprise data reset reproducibly', () => {
        const settings = repo.settings(admin);
        repo.updateSettings(
            {
                ...settings,
                organizationName: 'Nordic Operations',
                defaultReportDataset: 'assets',
            },
            admin,
        );
        expect(repo.organization(employee)).toMatchObject({
            organizationName: 'Nordic Operations',
            defaultReportDataset: 'assets',
        });
        repo.createReport(definition, admin);
        repo.transfer(
            'T001',
            { personId: 'P026', fromTeamId: 'T002', version: 1 },
            admin,
        );
        repo.reset();
        expect(repo.settings(admin)).toEqual(settings);
        expect(repo.reports(admin)).toHaveLength(4);
        expect(repo.person('P026', admin).person.teamId).toBe('T002');
        expect(repo.createReport(definition, admin).id).toBe('REP005');
    });

    it('checks known actors and versions before validating malformed configuration', () => {
        rejects(() => repo.updateSettings({ version: 99 }, admin), 409);
        rejects(() => repo.people({ ...admin, personId: 'unknown' }), 403);
        rejects(
            () => repo.createReport(definition, { ...manager, teamId: 'T002' }),
            403,
        );
        rejects(() => repo.person('missing', employee), 404);
        rejects(() => repo.report('missing', admin), 404);
    });
});
