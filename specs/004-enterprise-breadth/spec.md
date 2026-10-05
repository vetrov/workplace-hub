# Feature Specification: Enterprise Breadth

**Branch**: main | **Created**: 2026-10-05 | **Status**: Implemented; integration verification complete (evidence in tasks.md)
**Input**: Complete all remaining phases of the agreed Workplace Hub roadmap.

## User Scenarios & Testing

### US1 — Explore people and teams (P1)

Employees find colleagues and their profiles. Managers inspect their own team. Administrators
inspect all teams and transfer eligible colleagues between teams.
**Why**: People connect request ownership, inventory assignment and team reporting.
**Independent test**: Search the 80-person directory, follow a profile/team, transfer a non-manager
as an administrator and observe the changed membership and manager-visible inventory.
**Acceptance**:

1. Directory search and pagination have shareable query URLs; profiles show team and authorized related work.
2. Managers see their own team only, administrators see all 12; employees cannot inspect team management.
3. An administrator transfers a colleague with a current version and source-team check. Fixed demo identities
   and team managers cannot be transferred. Prior requests retain their historical team.
4. Empty/error/missing/permission states offer recovery; role/reset changes clear obsolete records and drafts.

### US2 — Maintain inventory (P1)

An administrator updates asset metadata and moves unassigned equipment between available,
maintenance and retired states.
**Why**: Completes the inventory lifecycle around the existing allocation workflow.
**Independent test**: Edit A0001 into maintenance, observe it disappear from assignment candidates,
then restore available. Assigned assets retain their allocation and type.
**Acceptance**:

1. Name, identifier, supplier, notes and allowed inventory state can be updated with optimistic versions.
2. Assigned assets keep status/type/assignee/request links; changing type is allowed only for unallocated inventory.
3. Invalid, stale, unauthorized and canceled writes leave stored data unchanged and failed saves retain inputs.
4. Saved updates appear in lists/details/history; dirty navigation offers discard/cancel and pending saves block leaving.

### US3 — Save and run reports (P2)

Managers and administrators save inventory/request report definitions with status/person filters,
inspect current scoped totals and rows, visualize the totals on demand and export permitted results.
**Why**: Makes a larger enterprise dataset useful across features.
**Independent test**: Save a requests report, reopen it by URL, verify owner/team scope, load the chart and export CSV.
**Acceptance**:

1. Saved report list is owner-scoped for managers; administrators can inspect all saved reports.
2. Configuration validates name, dataset, status and optional existing person before one save. Filters persist with the report.
3. Every run recomputes current authorized data. Results include totals by status and first 100 rows, with full matching count.
4. Report details resolve data on navigation, recover from failed/empty/missing/context-changed results and clear immediately on role changes.
5. Visualization loads on explicit demand with placeholder/loading/error UI; the table remains usable without it.
6. CSV exports all authorized matching rows, quote safely and neutralize spreadsheet formula prefixes.
7. Managers cannot read another owner's report, use out-of-team people filters or bypass disabled creation/export permissions.

### US4 — Configure the organization (P2)

Administrators configure manager report capabilities, category names/availability and organization
name/default report dataset. Changes visibly affect later operations.
**Why**: Gives the remaining administration screens concrete, connected behavior.
**Independent test**: Disable equipment submissions, verify a new submission is rejected while its draft
remains permitted; disable manager report creation/export; change organization name/default report dataset.
**Acceptance**:

1. Each of the three screens shows saved values and saves validated settings with optimistic versions.
2. Category codes stay fixed; labels are unique, nonblank, 3–60 characters; inactive categories block future submitted requests.
3. Manager creation/export capabilities are enforced in mock commands and reflected in Reports actions; admin privileges remain fixed.
4. Organization name (3–80 characters) appears in the shell; default dataset initializes new report configuration.
5. Invalid/forbidden/stale/canceled writes preserve data. Reset restores settings, memberships, assets and saved reports.

## Requirements

- **FR-001**: Deliver the remaining 11 business routes in docs/route-map.md; replace planned navigation with real links.
- **FR-002**: Implement directory/profile and scoped team membership behavior from US1.
- **FR-003**: Implement versioned asset editing and protected allocation relationships from US2.
- **FR-004**: Implement scoped saved report creation/list/results, status/person filters, live totals and CSV export from US3.
- **FR-005**: Implement versioned roles/categories/settings with observable cross-feature effects from US4.
- **FR-006**: Preserve all existing forms/profiles and browser-only deterministic scenarios with known actor, version and cancellation checks.
- **FR-007**: All new views support appropriate loading/empty/error/permission states, keyboard operation and 390px layout.
- **FR-008**: Editors retain failed inputs, clear on identity/reset, prevent duplicate writes and protect dirty/pending navigation.
- **FR-009**: Add meaningful remaining Angular examples in their assigned business features; no evaluation pages/tools.
- **FR-010**: Focused automated and browser verification covers relationships, permissions, conflicts and principal cross-feature flows.

## Key Entities

Person/team: existing IDs and names; versioned team membership, protected managers/demo identities.
Saved report: stable ID, owner ID, name, requests/assets dataset, status/person filters, version.
Report run: definition, current authorized total, status buckets, first 100 rows, full export.
Role configuration: manager creation/export flags and version. Category: fixed code, label, enabled, version.
Organization settings: name, default report dataset, version. Asset: existing detail plus versioned maintenance updates.

## Edge Cases

Existing request team IDs describe historical routing, while inventory visibility follows current membership.
Moving a protected manager/demo identity is rejected. Transferring the same person twice with an obsolete source
or team version conflicts. Report visibility is recomputed every run/export; configuration never grants access.
CSV names can contain commas/quotes/newlines/formula prefixes. Report route resolver cancellation must produce
recoverable route data. Generation changes cancel all delayed writes. Editors must preserve input after a failed
response, including retrying unchanged values. Native custom controls must display initially loaded selections.

## Success Criteria

- **SC-001**: All 29 planned business screens are functional with correct direct navigation and role restrictions.
- **SC-002**: Person transfer → team inventory scope, maintenance → assignment eligibility, report → live data,
  category → submission, roles → report actions, settings → shell/defaults are verified.
- **SC-003**: Invalid/stale/forbidden/context-canceled operations change no records; reset reproduces all seed data.
- **SC-004**: New screens pass keyboard/recovery/mobile checks and existing request-to-asset/Suppliers/policies flows still pass.

## Assumptions

Session-local in-memory changes; no authentication/backend/deployment. Team transfer is administrator-only.
No people CRUD, bulk employee reassignment, report scheduling or chart dependency. Keep 80 people/12 teams/40 suppliers/
250 requests/2000 assets; seed two reports per report-capable identity. Report summaries/export use full authorized data,
while rendered table caps at 100. No service-category wizard creation beyond existing equipment/software workflow.
