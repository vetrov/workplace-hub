# Tasks: Enterprise Breadth

Input: spec, plan, research, data model and contracts. No clarification blockers; checklist8/8.

## Phase 1: Setup

- [x] T001 Specify/design/research enterprise breadth, create artifacts and check constitution.

## Phase 2: Shared foundation

- [x] T002 Implement domain enterprise contracts/validators/CSV in models/enterprise.ts and policies/enterprise.ts; focused domain tests first.
- [x] T003 Implement immutable enterprise-repository.ts and mock endpoints; tests for permissions, relationships, versions, export and context cancellation first.

## Phase 3: US1 — People and Teams

- [ ] T004 Implement features/people directory/profile and features/teams list/detail/transfer; EmployeePicker CVA/validators; query navigation, scoped links and focused tests.

## Phase 4: US2 — Inventory maintenance

- [ ] T005 Implement asset-editor.ts with reactive editor helper, typed form, allowed transitions/allocation protection, dirty guard and live detail/list/history integration; tests and browser workflow.

## Phase 5: US3 — Reports

- [ ] T006 Implement saved report list/configuration, functional report resolver/recovery and results/export with typed projected table; test filters, native custom control, resolver cancellation/retry and permission states.
- [ ] T007 Add deferred standalone report chart with placeholder/loading/error, dynamic Dashboard widget registry and generic host directive; custom structural role directive/display pipe, modern queries/render focus; verify actual lazy/dynamic behavior.

## Phase 6: US4 — Organization administration

- [ ] T008 Implement roles/categories/settings pages, versioned saves/dirty guards, live shell/default/category integration; verify category submission and manager report capabilities.

## Phase 7: Integration

- [ ] T009 Verify all11 new routes and principal stories in Chrome (keyboard,390px,states,permissions,cancellation), run complete tests/app/library builds; update route/coverage/docs with source evidence and converge.

Dependencies: T001→T002→T003→T004→T005→T006→T007→T008→T009.
Each completed task is a local commit. Tests are part of owning implementation; no failing suite committed.
Main branch retained; no push/PR/deployment. Milestone5 completion audit follows this feature.

## Evidence

T001: Checklist8/8; pinned API research completed by two read-only research agents; constitution pre/post gates pass.

T002: 101 tests across 19 files pass, including 11 enterprise boundary/normalization/CSV checks. No new dependencies.

T003: 115 tests across21 files and production build pass. Live report scoping/full CSV, membership transfers, protected allocation, config effects, optimistic versions and delayed reset/identity/unsubscribe cancellation verified.
