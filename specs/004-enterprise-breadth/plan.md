# Implementation Plan: Enterprise Breadth

**Branch**: main | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

## Summary and Technical Context

Complete the remaining 11 routes using the pinned Angular 22.2.1/TypeScript 6.0.3/RxJS 7.8.2 stack.
No new dependencies, SSR or external business services. Older API examples remain isolated in Suppliers;
the whole application remains zoneless (legacy notifications use AsyncPipe/markForCheck).

## Constitution Check

Pre/post-design checks pass: preserve every existing profile; enterprise pages stay lazy standalone;
domain owns validation/permissions, UI owns generic controls/composition, mock owns immutable relationships.
Deterministic seed/reset/scenarios and strict typing remain. No evaluation work or incompatible APIs.

## Architecture and Structure

- domain/models/enterprise.ts and policies/enterprise.ts: typed reports, profiles/teams/config and validation/CSV rules.
- core/mock-http/enterprise-repository.ts extends AdministrationRepository; MockRepository extends it.
  Preserve constructor/reset ordering with final explicit initialization. No mutation of frozen seed records.
- Existing root dispatcher handles additional endpoints using its snapshot/context/scenario boundary.
- core/reactive-editor.ts: scoped form notification/identity/reset/load/dirty behavior; WorkflowClient remains single-flight.
- features/people/: paged query directory and scoped profile links.
- features/teams/: list and versioned membership transfer; generic EmployeePicker CVA in ui with NG_VALIDATORS.
- features/assets/asset-editor.ts: typed Reactive Forms and immutable maintenance/type/allocation constraints.
- features/reports/: saved list/configuration, resolver, projected results table, deferred chart and CSV action.
- features/administration/organization-editor.ts: three route-data-selected typed configuration forms;
  actual Signal Forms policies remain untouched. Live org summary labels/defaults and category submission checks.
- core/role-only.ts: custom structural directive for role-aware actions, preserving server permission enforcement.
- ui/composed-table.ts: typed column directives, contentChildren, ng-template context guard and NgTemplateOutlet.
- ui/display-label.ts pipe and widget-surface.ts host directive; Dashboard uses typed NgComponentOutlet registry.
- Root routes/shell and existing request/inventory integration updated sequentially.

## Data/Transport Design

Team transfers check target version and current source, reject protected demo identities/managers, advance both
team versions and replace person.teamId immutably. Historical requests keep their original team IDs.
Asset edits validate before replacement and retain allocation links/history; assigned type/status are fixed.
Saved reports are manager-owned/admin-readable. Definitions validate dataset, allowed status and authorized person.
Every run/export filters with canSeeRequest/canSeeAsset before applying definition filters; full totals/export,
first 100 rendered rows. Admin cannot turn a manager's report into unscoped data for that manager.
Config records have optimistic versions. Category enabled flags validate future submitted requests only.
Role flags affect manager report creation/export, not base demo roles. Settings expose name/default dataset through
an all-identity, names-only organization endpoint. CSV quoting and formula-prefix neutralization live in domain.

## Angular Delivery Decisions

Report ResolveFn returns cancelable HttpClient Observable, maps errors and defaultIfEmpty into typed recovery data.
Result page is input-bound and hides obsolete context synchronously, then page-local httpResource refreshes;
resolver serves first navigation, resource handles subsequent context changes/retry without global router configuration.
EmployeePicker calls changed only on user selection, touched on blur, and validatorChanged on options updates;
uses native select explicit selected bindings, setDisabledState and required parent validators where applicable.
Projected table's generic directive takes a typed ColumnSpec<T> inference input and context guard; queried cells
render with NgTemplateOutlet. Structural role directive observes signals; backend remains authoritative.
Report chart is standalone and referenced only inside @defer (on interaction) with placeholder/loading/error.
Dashboard registry maps component types/common inputs; shared host directive gives region labeling/focus behavior.
Render focus uses afterNextRender with explicit Injector from event callbacks and optional viewChild.

## Delivery and Verification

Contracts/repository/HTTP first, then People/Teams, asset editing, reports, administration and dashboard patterns.
Focused tests cover domain/relationship boundaries and real custom control/editor/resolver behavior. Each step
formats, checks appropriate tests/builds and commits locally. Chrome checks principal cross-feature stories,
context cancellation, response states, direct navigation, keyboard and 390px. Final audit is separate milestone 5.
