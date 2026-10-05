export type DemoRole = 'employee' | 'manager' | 'administrator';
export type RequestCategory = 'equipment' | 'software' | 'service';
export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'fulfilled';
export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type ScenarioMode = 'normal' | 'empty' | 'delayed' | 'error';
export type ListKind = 'requests' | 'assets';

export interface Person { readonly id: string; readonly name: string; readonly email: string; readonly teamId: string; }
export interface Team { readonly id: string; readonly name: string; readonly managerId: string; }
export interface DemoIdentity { readonly personId: string; readonly role: DemoRole; readonly teamId: string; readonly label: string; }
export interface Supplier { readonly id: string; readonly name: string; }
export interface RequestSummary {
  readonly id: string;
  readonly title: string;
  readonly requesterId: string;
  readonly teamId: string;
  readonly category: RequestCategory;
  readonly status: RequestStatus;
  readonly createdAt: string;
}
export interface AssetSummary {
  readonly id: string;
  readonly name: string;
  readonly type: 'equipment' | 'software';
  readonly status: AssetStatus;
  readonly supplierId: string;
  readonly assigneeId: string | null;
}
export interface DisplayPreferences { appearance: 'light' | 'dark'; density: 'comfortable' | 'compact'; }
export interface ListQuery { readonly q: string; readonly sort: string; readonly page: number; readonly pageSize: 25 | 50 | 100; }
export interface ScenarioState { readonly mode: ScenarioMode; readonly generation: number; }
export interface PageResult<T> { readonly items: readonly T[]; readonly total: number; readonly page: number; readonly pageSize: number; readonly contextKey: string; readonly queryKey?: string; }
export interface DashboardSummary { readonly requests: number; readonly pending: number; readonly assets: number; readonly available: number; readonly contextKey: string; }
export interface SeedData {
  readonly people: readonly Person[];
  readonly teams: readonly Team[];
  readonly suppliers: readonly Supplier[];
  readonly requests: readonly RequestSummary[];
  readonly assets: readonly AssetSummary[];
}

export const DEFAULT_PREFERENCES: Readonly<DisplayPreferences> = Object.freeze({ appearance: 'light', density: 'comfortable' });
export const REQUEST_SORTS = ['createdAt:desc', 'createdAt:asc', 'title:asc', 'title:desc'] as const;
export const ASSET_SORTS = ['name:asc', 'name:desc', 'status:asc', 'status:desc'] as const;

export function normalizeQuery(kind: ListKind, params: Record<string, string | null | undefined>): ListQuery {
  const sorts: readonly string[] = kind === 'requests' ? REQUEST_SORTS : ASSET_SORTS;
  const page = Number(params['page']);
  const size = Number(params['pageSize']);
  return {
    q: (params['q'] ?? '').trim(),
    sort: sorts.includes(params['sort'] ?? '') ? params['sort']! : sorts[0],
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize: size === 50 || size === 100 ? size : 25,
  };
}
