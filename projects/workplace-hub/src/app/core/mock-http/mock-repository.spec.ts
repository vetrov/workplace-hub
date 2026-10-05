import { AssetSummary, RequestSummary } from 'domain';
import { MockRepository } from './mock-repository';
import { DEMO_IDENTITIES } from './seed-data';

describe('visible mock records', () => {
  it('filters employees before paging and computing totals', () => {
    const repo = new MockRepository();
    const employee = DEMO_IDENTITIES[0];
    const requests = repo.list('requests', {}, employee, 'test');
    expect(
      requests.items.every((r) => (r as RequestSummary).requesterId === employee.personId),
    ).toBe(true);
    expect(requests.total).toBe(
      repo.data.requests.filter((r) => r.requesterId === employee.personId).length,
    );
    const assets = repo.list('assets', {}, employee, 'test');
    expect(assets.items.every((a) => (a as AssetSummary).assigneeId === employee.personId)).toBe(
      true,
    );
  });
  it('limits managers to their team and dashboard to visible records', () => {
    const repo = new MockRepository();
    const manager = DEMO_IDENTITIES[1];
    const requests = repo.list('requests', {}, manager, 'test');
    expect(requests.items.every((r) => (r as RequestSummary).teamId === manager.teamId)).toBe(true);
    const assets = repo.list('assets', {}, manager, 'test');
    expect(
      assets.items.every(
        (a) =>
          repo.data.people.find((p) => p.id === (a as AssetSummary).assigneeId)?.teamId ===
          manager.teamId,
      ),
    ).toBe(true);
    expect(repo.dashboard(manager, 'test').requests).toBe(requests.total);
  });
  it('normalizes queries, uses stable ordering, and bounds pages', () => {
    const repo = new MockRepository();
    const admin = DEMO_IDENTITIES[2];
    expect(
      repo.list('assets', { page: '999', pageSize: '50', sort: 'name:asc' }, admin, 'test').page,
    ).toBe(40);
    const search = repo.list('requests', { q: 'LAPTOP', sort: 'title:asc' }, admin, 'test');
    expect(
      search.items.every((r) => (r as RequestSummary).title.toLowerCase().includes('laptop')),
    ).toBe(true);
    expect(
      repo.list('requests', { page: '-1', pageSize: '2', sort: 'invalid' }, admin, 'test').pageSize,
    ).toBe(25);
  });
});
