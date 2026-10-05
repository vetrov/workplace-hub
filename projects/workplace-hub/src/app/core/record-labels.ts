import { INITIAL_DATA } from './mock-http/seed-data';

export const personName = (id: string | null) =>
    INITIAL_DATA.people.find((p) => p.id === id)?.name ?? 'Unassigned';

export const supplierName = (id: string) =>
    INITIAL_DATA.suppliers.find((s) => s.id === id)?.name ?? 'Unknown supplier';
