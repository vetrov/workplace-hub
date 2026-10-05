import { INITIAL_DATA } from './mock-http/seed-data';

export const personName = (id: string | null) =>
    INITIAL_DATA.people.find((p) => p.id === id)?.name ?? 'Unassigned';
