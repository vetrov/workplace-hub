import { AssetStatus, DemoIdentity, RequestCategory, RequestStatus, SeedData } from 'domain';

const id = (prefix: string, number: number, digits = 3) =>
  `${prefix}${String(number).padStart(digits, '0')}`;
const firstNames = ['Alex', 'Morgan', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Robin', 'Jamie'];
const lastNames = [
  'Chen',
  'Patel',
  'Reed',
  'Garcia',
  'Klein',
  'Silva',
  'Park',
  'Berg',
  'Ahmed',
  'Lane',
];
const teamNames = [
  'Engineering',
  'Product',
  'Design',
  'Finance',
  'People',
  'Operations',
  'Marketing',
  'Sales',
  'Support',
  'IT',
  'Legal',
  'Research',
];
const titles = [
  'Laptop replacement',
  'External monitor',
  'Software license',
  'Ergonomic chair',
  'Office equipment',
  'Team onboarding',
];
const requestStates: readonly RequestStatus[] = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'fulfilled',
];
const categories: readonly RequestCategory[] = ['equipment', 'software', 'service'];
const assetStates: readonly AssetStatus[] = ['available', 'assigned', 'maintenance', 'retired'];
const assetNames = [
  'MacBook Pro 14',
  'Dell UltraSharp 27',
  'iPhone 16',
  'Steelcase Series 2',
  'Adobe Creative Cloud',
  'ThinkPad X1 Carbon',
  'Logitech MX Keys',
  'Notion Workspace',
];

export const DEMO_IDENTITIES: readonly DemoIdentity[] = Object.freeze([
  Object.freeze({
    personId: 'P025',
    teamId: 'T001',
    role: 'employee',
    label: 'Alex Garcia · Employee',
  }),
  Object.freeze({
    personId: 'P001',
    teamId: 'T001',
    role: 'manager',
    label: 'Alex Chen · Manager',
  }),
  Object.freeze({
    personId: 'P013',
    teamId: 'T001',
    role: 'administrator',
    label: 'Taylor Patel · Administrator',
  }),
]);

export function createSeedData(): SeedData {
  const people = Array.from({ length: 80 }, (_, i) => ({
    id: id('P', i + 1),
    name: `${firstNames[i % 8]} ${lastNames[Math.floor(i / 8)]}`,
    email: `person${i + 1}@workplace.example`,
    teamId: id('T', (i % 12) + 1),
  }));
  const teams = teamNames.map((name, i) => ({ id: id('T', i + 1), name, managerId: people[i].id }));
  const suppliers = Array.from({ length: 40 }, (_, i) => ({
    id: id('S', i + 1),
    name: `${['Northstar Systems', 'Atlas Supply', 'Meridian Digital', 'Oak & Co'][i % 4]} ${String(i + 1).padStart(2, '0')}`,
  }));
  const requests = Array.from({ length: 250 }, (_, i) => ({
    id: id('R', i + 1, 4),
    title: titles[i % titles.length],
    requesterId: people[i % 80].id,
    teamId: people[i % 80].teamId,
    category: categories[i % 3],
    status: requestStates[i % 5],
    createdAt: new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString(),
  }));
  const assets = Array.from({ length: 2000 }, (_, i) => ({
    id: id('A', i + 1, 4),
    name: assetNames[i % assetNames.length],
    type: i % 5 === 0 ? ('software' as const) : ('equipment' as const),
    status: assetStates[i % 4],
    supplierId: suppliers[i % 40].id,
    assigneeId: i % 4 === 1 ? people[Math.floor(i / 4) % 80].id : null,
  }));
  const data: SeedData = { people, teams, suppliers, requests, assets };
  for (const records of Object.values(data)) {
    for (const record of records) Object.freeze(record);
    Object.freeze(records);
  }
  return Object.freeze(data);
}

export const INITIAL_DATA = createSeedData();
