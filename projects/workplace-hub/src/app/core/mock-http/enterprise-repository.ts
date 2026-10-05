import {
    AssetDetail,
    DemoIdentity,
    EnterpriseStore,
    OrganizationSettings,
    OrganizationSummary,
    Person,
    PersonView,
    ReportInput,
    ReportRow,
    ReportRun,
    RequestCategoryConfig,
    RequestDetail,
    RoleConfiguration,
    SavedReport,
    TeamView,
    VersionedTeam,
    canEditRequest,
    canSeeAsset,
    canSeeRequest,
    commandBody,
    expectedVersion,
    reportCsv,
    reportRole,
    requireRule,
    validateAssetUpdate,
    validateCategory,
    validateOrganization,
    validateReport,
    validateRequest,
    validateRoles,
} from 'domain';
import { AdministrationRepository } from './administration-repository';
import { DEMO_IDENTITIES } from './seed-data';

function immutable<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(immutable);
        Object.freeze(value);
    }
    return value;
}

export class EnterpriseRepository
    extends AdministrationRepository
    implements EnterpriseStore
{
    private savedReports: readonly SavedReport[] = [];
    private reportCounter = 4;
    private roleRecord!: RoleConfiguration;
    private categoryRecords: readonly RequestCategoryConfig[] = [];
    private settingsRecord!: OrganizationSettings;

    constructor() {
        super();
        this.reset();
    }

    override reset(): void {
        super.reset();
        this.data = immutable({
            ...this.data,
            teams: this.data.teams.map((t) => ({ ...t, version: 1 })),
        });
        this.reportCounter = 4;
        this.savedReports = immutable([
            {
                id: 'REP001',
                ownerId: 'P001',
                name: 'Team pending requests',
                dataset: 'requests',
                status: 'submitted',
                personId: '',
                version: 1,
            },
            {
                id: 'REP002',
                ownerId: 'P001',
                name: 'Team assigned inventory',
                dataset: 'assets',
                status: 'assigned',
                personId: '',
                version: 1,
            },
            {
                id: 'REP003',
                ownerId: 'P013',
                name: 'Organization inventory',
                dataset: 'assets',
                status: '',
                personId: '',
                version: 1,
            },
            {
                id: 'REP004',
                ownerId: 'P013',
                name: 'Approved requests',
                dataset: 'requests',
                status: 'approved',
                personId: '',
                version: 1,
            },
        ]);
        this.roleRecord = immutable({
            managerCanCreateReports: true,
            managerCanExportReports: true,
            version: 1,
        });
        this.categoryRecords = immutable(
            (['equipment', 'software', 'service'] as const).map((id) => ({
                id,
                label: id[0].toUpperCase() + id.slice(1),
                enabled: true,
                version: 1,
            })),
        );
        this.settingsRecord = immutable({
            organizationName: 'Workplace Hub',
            defaultReportDataset: 'requests',
            version: 1,
        });
    }

    private requireActor(actor: DemoIdentity): void {
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

    private requireAdministrator(actor: DemoIdentity): void {
        this.requireActor(actor);
        requireRule(
            actor.role === 'administrator',
            403,
            'Only administrators can change organization records.',
        );
    }

    people(actor: DemoIdentity): readonly Person[] {
        this.requireActor(actor);
        return this.data.people;
    }

    person(id: string, actor: DemoIdentity): PersonView {
        const person = this.people(actor).find((p) => p.id === id);
        requireRule(person, 404, 'This person does not exist.');
        return {
            person,
            team: this.data.teams.find((t) => t.id === person.teamId)!,
            requests: (this.data.requests as readonly RequestDetail[]).filter(
                (r) => r.requesterId === id && canSeeRequest(r, actor),
            ),
            assets: (this.data.assets as readonly AssetDetail[]).filter(
                (a) =>
                    a.assigneeId === id &&
                    canSeeAsset(a, actor, this.data.people),
            ),
        };
    }

    teams(actor: DemoIdentity): readonly VersionedTeam[] {
        this.requireActor(actor);
        requireRule(
            reportRole(actor.role),
            403,
            'Select a manager or administrator to inspect teams.',
        );
        return (this.data.teams as readonly VersionedTeam[]).filter(
            (t) => actor.role === 'administrator' || t.id === actor.teamId,
        );
    }

    team(id: string, actor: DemoIdentity): TeamView {
        this.requireActor(actor);
        requireRule(
            reportRole(actor.role) &&
                (actor.role === 'administrator' || id === actor.teamId),
            403,
            'This identity cannot inspect this team.',
        );
        const team = (this.data.teams as readonly VersionedTeam[]).find(
            (t) => t.id === id,
        );
        requireRule(team, 404, 'This team does not exist.');
        const members = this.data.people.filter((p) => p.teamId === id),
            ids = new Set(members.map((p) => p.id));
        return {
            team,
            members,
            requests: (this.data.requests as readonly RequestDetail[]).filter(
                (r) => r.teamId === id && canSeeRequest(r, actor),
            ),
            assets: (this.data.assets as readonly AssetDetail[]).filter(
                (a) =>
                    a.assigneeId &&
                    ids.has(a.assigneeId) &&
                    canSeeAsset(a, actor, this.data.people),
            ),
        };
    }

    transfer(id: string, value: unknown, actor: DemoIdentity): TeamView {
        this.requireAdministrator(actor);
        const target = this.team(id, actor).team,
            body = commandBody(value);
        expectedVersion(body['version'], target.version);
        const person = this.data.people.find((p) => p.id === body['personId']);
        requireRule(person, 400, 'Choose an existing colleague.');
        requireRule(
            !DEMO_IDENTITIES.some((a) => a.personId === person.id) &&
                !this.data.teams.some((t) => t.managerId === person.id),
            400,
            'Team managers and fixed demo identities cannot be transferred.',
        );
        requireRule(
            person.teamId === body['fromTeamId'] && person.teamId !== id,
            409,
            'This colleague changed teams. Reload membership before trying again.',
        );
        this.data = immutable({
            ...this.data,
            people: this.data.people.map((p) =>
                p.id === person.id ? { ...p, teamId: id } : p,
            ),
            teams: (this.data.teams as readonly VersionedTeam[]).map((t) =>
                t.id === id || t.id === person.teamId
                    ? { ...t, version: t.version + 1 }
                    : t,
            ),
        });
        return this.team(id, actor);
    }

    updateAsset(id: string, value: unknown, actor: DemoIdentity): AssetDetail {
        this.requireAdministrator(actor);
        const current = this.asset(id, actor),
            body = commandBody(value);
        expectedVersion(body['version'], current.version);
        const input = validateAssetUpdate(body);
        requireRule(
            this.data.suppliers.some((s) => s.id === input.supplierId),
            400,
            'Choose an existing supplier.',
        );
        if (current.status === 'assigned')
            requireRule(
                input.status === 'assigned' && input.type === current.type,
                409,
                'Assigned inventory must keep its type and assignment state.',
            );
        else
            requireRule(
                input.status !== 'assigned' &&
                    !current.assigneeId &&
                    !current.requestId,
                409,
                'Use the allocation workflow to assign inventory.',
            );
        const record: AssetDetail = immutable({
            ...current,
            ...input,
            version: current.version + 1,
            history: [
                ...current.history,
                {
                    id: `H-EDIT-${id}-${current.version + 1}`,
                    action: 'updated',
                    actorId: actor.personId,
                    occurredAt: new Date().toISOString(),
                    note: `Inventory updated (${input.status}).`,
                },
            ],
        });
        this.data = immutable({
            ...this.data,
            assets: this.data.assets.map((a) => (a.id === id ? record : a)),
        });
        return record;
    }

    private requireReporter(actor: DemoIdentity): void {
        this.requireActor(actor);
        requireRule(
            reportRole(actor.role),
            403,
            'Reports are available to managers and administrators.',
        );
    }

    reports(actor: DemoIdentity): readonly SavedReport[] {
        this.requireReporter(actor);
        return this.savedReports.filter(
            (r) =>
                actor.role === 'administrator' || r.ownerId === actor.personId,
        );
    }

    createReport(value: unknown, actor: DemoIdentity): SavedReport {
        this.requireReporter(actor);
        requireRule(
            actor.role === 'administrator' ||
                this.roleRecord.managerCanCreateReports,
            403,
            'Manager report creation is disabled by organization settings.',
        );
        const input = validateReport(value);
        if (input.personId) {
            const person = this.data.people.find(
                (p) => p.id === input.personId,
            );
            requireRule(person, 400, 'Choose an existing person.');
            requireRule(
                actor.role === 'administrator' ||
                    person.teamId === actor.teamId,
                403,
                'Choose a person in your team.',
            );
        }
        const record = immutable({
            ...input,
            id: `REP${String(++this.reportCounter).padStart(3, '0')}`,
            ownerId: actor.personId,
            version: 1,
        });
        this.savedReports = immutable([...this.savedReports, record]);
        return record;
    }

    private reportDefinition(id: string, actor: DemoIdentity): SavedReport {
        this.requireReporter(actor);
        const report = this.savedReports.find((r) => r.id === id);
        requireRule(report, 404, 'This saved report does not exist.');
        requireRule(
            actor.role === 'administrator' || report.ownerId === actor.personId,
            403,
            'This identity cannot read this saved report.',
        );
        return report;
    }

    private reportRows(
        definition: ReportInput,
        actor: DemoIdentity,
    ): readonly ReportRow[] {
        const rows: readonly ReportRow[] =
            definition.dataset === 'requests'
                ? this.data.requests
                      .filter((r) => canSeeRequest(r, actor))
                      .map((r) => ({
                          id: r.id,
                          label: r.title,
                          status: r.status,
                          personId: r.requesterId,
                      }))
                : this.data.assets
                      .filter((a) => canSeeAsset(a, actor, this.data.people))
                      .map((a) => ({
                          id: a.id,
                          label: a.name,
                          status: a.status,
                          personId: a.assigneeId ?? '',
                      }));
        return rows.filter(
            (r) =>
                (!definition.status || r.status === definition.status) &&
                (!definition.personId || r.personId === definition.personId),
        );
    }

    report(id: string, actor: DemoIdentity): ReportRun {
        const report = this.reportDefinition(id, actor),
            rows = this.reportRows(report, actor),
            counts = new Map<string, number>();
        for (const row of rows)
            counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
        return {
            report,
            total: rows.length,
            rows: rows.slice(0, 100),
            buckets: [...counts]
                .map(([label, count]) => ({ label, count }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        };
    }

    exportReport(id: string, actor: DemoIdentity): string {
        const definition = this.reportDefinition(id, actor);
        requireRule(
            actor.role === 'administrator' ||
                this.roleRecord.managerCanExportReports,
            403,
            'Manager CSV export is disabled by organization settings.',
        );
        return reportCsv(this.reportRows(definition, actor));
    }

    organization(actor: DemoIdentity): OrganizationSummary {
        this.requireActor(actor);
        return {
            organizationName: this.settingsRecord.organizationName,
            defaultReportDataset: this.settingsRecord.defaultReportDataset,
            managerCanCreateReports: this.roleRecord.managerCanCreateReports,
            managerCanExportReports: this.roleRecord.managerCanExportReports,
            categories: this.categoryRecords.map(({ id, label, enabled }) => ({
                id,
                label,
                enabled,
            })),
        };
    }

    roles(actor: DemoIdentity): RoleConfiguration {
        this.requireAdministrator(actor);
        return this.roleRecord;
    }

    updateRoles(value: unknown, actor: DemoIdentity): RoleConfiguration {
        const current = this.roles(actor),
            body = commandBody(value);
        expectedVersion(body['version'], current.version);
        this.roleRecord = immutable({
            ...validateRoles(body),
            version: current.version + 1,
        });
        return this.roleRecord;
    }

    categories(actor: DemoIdentity): readonly RequestCategoryConfig[] {
        this.requireAdministrator(actor);
        return this.categoryRecords;
    }

    updateCategory(
        id: string,
        value: unknown,
        actor: DemoIdentity,
    ): RequestCategoryConfig {
        const current = this.categories(actor).find((c) => c.id === id);
        requireRule(current, 404, 'This category does not exist.');
        const body = commandBody(value);
        expectedVersion(body['version'], current.version);
        const input = validateCategory(body);
        requireRule(
            !this.categoryRecords.some(
                (c) =>
                    c.id !== id &&
                    c.label.toLowerCase() === input.label.toLowerCase(),
            ),
            409,
            'Category labels must be unique.',
        );
        const record = immutable({
            ...current,
            ...input,
            version: current.version + 1,
        });
        this.categoryRecords = immutable(
            this.categoryRecords.map((c) => (c.id === id ? record : c)),
        );
        return record;
    }

    settings(actor: DemoIdentity): OrganizationSettings {
        this.requireAdministrator(actor);
        return this.settingsRecord;
    }

    updateSettings(value: unknown, actor: DemoIdentity): OrganizationSettings {
        const current = this.settings(actor),
            body = commandBody(value);
        expectedVersion(body['version'], current.version);
        this.settingsRecord = immutable({
            ...validateOrganization(body),
            version: current.version + 1,
        });
        return this.settingsRecord;
    }

    private categoryAllowed(value: unknown): void {
        const input = validateRequest(value);
        if (input.status === 'submitted')
            requireRule(
                this.categoryRecords.some(
                    (c) => c.id === input.category && c.enabled,
                ),
                400,
                'This request category is disabled. Save a draft or choose an available category.',
            );
    }

    override createRequest(value: unknown, actor: DemoIdentity): RequestDetail {
        this.requireActor(actor);
        requireRule(
            actor.role === 'employee',
            403,
            'Only employees can create requests.',
        );
        this.categoryAllowed(value);
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
        this.categoryAllowed(value);
        return super.updateRequest(id, value, actor);
    }
}
