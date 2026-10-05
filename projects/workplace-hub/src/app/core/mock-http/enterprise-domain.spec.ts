import { describe, expect, it } from 'vitest';
import {
    validateReport,
    validateRoles,
    validateCategory,
    validateOrganization,
    validateAssetUpdate,
    reportCsv,
} from 'domain';

const report = {
    name: 'Team equipment',
    dataset: 'assets',
    status: 'available',
    personId: '',
};

describe('enterprise input boundaries and CSV export', () => {
    it('normalizes saved filter inputs without mutating the caller', () => {
        const input = { ...report, name: '  Team equipment  ' };
        expect(validateReport(input)).toEqual(report);
        expect(input.name).toBe('  Team equipment  ');
    });

    it.each([
        { ...report, name: '  ' },
        { ...report, dataset: 'people' },
        { ...report, status: 'approved' },
        { ...report, personId: 42 },
        { ...report, name: 'x'.repeat(101) },
        null,
    ])('rejects invalid report definitions', (input) =>
        expect(() => validateReport(input)).toThrow(),
    );

    it('accepts request-specific status and optional person filters', () => {
        expect(
            validateReport({
                ...report,
                dataset: 'requests',
                status: 'approved',
                personId: 'P025',
            }).personId,
        ).toBe('P025');
    });

    it('rejects nonboolean role/category flags and unsupported organization defaults', () => {
        expect(() =>
            validateRoles({
                managerCanCreateReports: 'true',
                managerCanExportReports: true,
            }),
        ).toThrow();
        expect(() =>
            validateCategory({ label: 'Hardware', enabled: 1 }),
        ).toThrow();
        expect(() =>
            validateOrganization({
                organizationName: 'Company',
                defaultReportDataset: 'people',
            }),
        ).toThrow();
        expect(
            validateOrganization({
                organizationName: '  Nordic Operations  ',
                defaultReportDataset: 'assets',
            }).organizationName,
        ).toBe('Nordic Operations');
    });

    it('rejects invalid asset state before repository transitions', () => {
        expect(() =>
            validateAssetUpdate({
                name: 'Monitor',
                type: 'equipment',
                supplierId: 'S001',
                serialNumber: 'ABC',
                notes: '',
                status: 'deleted',
            }),
        ).toThrow();
    });

    it('quotes CSV fields and neutralizes spreadsheet formulas including whitespace', () => {
        const csv = reportCsv([
            {
                id: 'R1',
                label: ' =HYPERLINK("x")',
                status: 'approved',
                personId: 'P1',
            },
            {
                id: 'R2',
                label: 'A, B\n"quoted"',
                status: 'draft',
                personId: '',
            },
        ]);
        expect(csv).toContain('"\' =HYPERLINK(""x"")"');
        expect(csv).toContain('"A, B\n""quoted"""');
        expect(csv.split('\r\n')[0]).toBe('"ID","Name","Status","Person ID"');
    });
});
