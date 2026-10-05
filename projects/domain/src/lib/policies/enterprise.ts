import {
    AssetUpdate,
    OrganizationSettings,
    ReportInput,
    ReportRow,
    RoleConfiguration,
    RequestCategoryConfig,
    REPORT_STATUSES,
} from '../models/enterprise';
import { commandBody, requireRule, validateAsset } from './workflow';

function text(
    value: unknown,
    name: string,
    minimum: number,
    maximum: number,
): string {
    requireRule(typeof value === 'string', 400, `${name} must be text.`);
    const result = value.trim();
    requireRule(
        result.length >= minimum && result.length <= maximum,
        400,
        `${name} must contain ${minimum}–${maximum} characters.`,
    );
    return result;
}

function flag(value: unknown, name: string): boolean {
    requireRule(
        typeof value === 'boolean',
        400,
        `${name} must be true or false.`,
    );
    return value;
}

export function validateReport(value: unknown): ReportInput {
    const body = commandBody(value),
        dataset = body['dataset'];
    requireRule(
        dataset === 'assets' || dataset === 'requests',
        400,
        'Choose assets or requests.',
    );
    const status = text(body['status'], 'Status', 0, 30);
    requireRule(
        status === '' || REPORT_STATUSES[dataset].includes(status),
        400,
        'Choose a status for this dataset.',
    );
    return {
        name: text(body['name'], 'Report name', 3, 100),
        dataset,
        status,
        personId: text(body['personId'], 'Person filter', 0, 100),
    };
}

export function validateAssetUpdate(value: unknown): AssetUpdate {
    const body = commandBody(value),
        input = validateAsset(body);
    requireRule(
        ['available', 'assigned', 'maintenance', 'retired'].includes(
            String(body['status']),
        ),
        400,
        'Choose an inventory status.',
    );
    return { ...input, status: body['status'] as AssetUpdate['status'] };
}

export function validateRoles(
    value: unknown,
): Omit<RoleConfiguration, 'version'> {
    const body = commandBody(value);
    return {
        managerCanCreateReports: flag(
            body['managerCanCreateReports'],
            'Manager report creation',
        ),
        managerCanExportReports: flag(
            body['managerCanExportReports'],
            'Manager report export',
        ),
    };
}

export function validateCategory(
    value: unknown,
): Pick<RequestCategoryConfig, 'label' | 'enabled'> {
    const body = commandBody(value);
    return {
        label: text(body['label'], 'Category label', 3, 60),
        enabled: flag(body['enabled'], 'Category availability'),
    };
}

export function validateOrganization(
    value: unknown,
): Omit<OrganizationSettings, 'version'> {
    const body = commandBody(value),
        dataset = body['defaultReportDataset'];
    requireRule(
        dataset === 'assets' || dataset === 'requests',
        400,
        'Choose the default report dataset.',
    );
    return {
        organizationName: text(
            body['organizationName'],
            'Organization name',
            3,
            80,
        ),
        defaultReportDataset: dataset,
    };
}

export function reportCsv(rows: readonly ReportRow[]): string {
    const cell = (value: string): string => {
        const safe =
            /^[\s]*[=+@-]/.test(value) || /^[\t\r\n]/.test(value)
                ? `'${value}`
                : value;
        return `"${safe.replaceAll('"', '""')}"`;
    };
    return [
        ['ID', 'Name', 'Status', 'Person ID'],
        ...rows.map((r) => [r.id, r.label, r.status, r.personId]),
    ]
        .map((row) => row.map(cell).join(','))
        .join('\r\n');
}
