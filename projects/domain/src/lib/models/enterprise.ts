import { AdministrationStore } from './administration';
import {
    DemoIdentity,
    DemoRole,
    Person,
    Team,
    RequestCategory,
    AssetStatus,
} from './foundation';
import { AssetDetail, AssetInput, RequestDetail } from './workflow';

export type ReportDataset = 'requests' | 'assets';

export interface PersonView {
    readonly person: Person;
    readonly team: Team;
    readonly requests: readonly RequestDetail[];
    readonly assets: readonly AssetDetail[];
}

export interface VersionedTeam extends Team {
    readonly version: number;
}

export interface TeamView {
    readonly team: VersionedTeam;
    readonly members: readonly Person[];
    readonly requests: readonly RequestDetail[];
    readonly assets: readonly AssetDetail[];
}

export interface AssetUpdate extends AssetInput {
    status: AssetStatus;
}

export interface ReportInput {
    name: string;
    dataset: ReportDataset;
    status: string;
    personId: string;
}

export interface SavedReport extends ReportInput {
    readonly id: string;
    readonly ownerId: string;
    readonly version: number;
}

export interface ReportRow {
    readonly id: string;
    readonly label: string;
    readonly status: string;
    readonly personId: string;
}

export interface ReportBucket {
    readonly label: string;
    readonly count: number;
}

export interface ReportRun {
    readonly report: SavedReport;
    readonly total: number;
    readonly rows: readonly ReportRow[];
    readonly buckets: readonly ReportBucket[];
}

export interface RoleConfiguration {
    managerCanCreateReports: boolean;
    managerCanExportReports: boolean;
    readonly version: number;
}

export interface RequestCategoryConfig {
    readonly id: RequestCategory;
    label: string;
    enabled: boolean;
    readonly version: number;
}

export interface OrganizationSettings {
    organizationName: string;
    defaultReportDataset: ReportDataset;
    readonly version: number;
}

export interface OrganizationSummary {
    readonly organizationName: string;
    readonly defaultReportDataset: ReportDataset;
    readonly managerCanCreateReports: boolean;
    readonly managerCanExportReports: boolean;
    readonly categories: readonly Pick<
        RequestCategoryConfig,
        'id' | 'label' | 'enabled'
    >[];
}

export interface EnterpriseStore extends AdministrationStore {
    people(actor: DemoIdentity): readonly Person[];
    person(id: string, actor: DemoIdentity): PersonView;
    teams(actor: DemoIdentity): readonly VersionedTeam[];
    team(id: string, actor: DemoIdentity): TeamView;
    transfer(id: string, input: unknown, actor: DemoIdentity): TeamView;
    updateAsset(id: string, input: unknown, actor: DemoIdentity): AssetDetail;
    reports(actor: DemoIdentity): readonly SavedReport[];
    createReport(input: unknown, actor: DemoIdentity): SavedReport;
    report(id: string, actor: DemoIdentity): ReportRun;
    exportReport(id: string, actor: DemoIdentity): string;
    organization(actor: DemoIdentity): OrganizationSummary;
    roles(actor: DemoIdentity): RoleConfiguration;
    updateRoles(input: unknown, actor: DemoIdentity): RoleConfiguration;
    categories(actor: DemoIdentity): readonly RequestCategoryConfig[];
    updateCategory(
        id: string,
        input: unknown,
        actor: DemoIdentity,
    ): RequestCategoryConfig;
    settings(actor: DemoIdentity): OrganizationSettings;
    updateSettings(input: unknown, actor: DemoIdentity): OrganizationSettings;
}

export const REPORT_STATUSES: Readonly<
    Record<ReportDataset, readonly string[]>
> = {
    requests: ['draft', 'submitted', 'approved', 'rejected', 'fulfilled'],
    assets: ['available', 'assigned', 'maintenance', 'retired'],
};

export function reportRole(role: DemoRole): boolean {
    return role === 'manager' || role === 'administrator';
}
