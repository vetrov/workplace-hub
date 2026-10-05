# Tasks: Application Foundation

**Input**: Design documents from `/specs/001-application-foundation/`.
**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/foundation.md.
**Status**: 9/23 tasks complete; implementation in progress.

## Format: `[ID] [P?] [Story] Description`

Task IDs are sequential. Story labels map to spec.md. Paths are relative to the repository root.
`[P]` indicates independent files only after stated prerequisites are complete; it is not an
instruction to launch agents or to perform user-approved work in another chat.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Verify Node/npm, Angular framework/CLI 22.2.1 publication, and compiler peer requirements; record exact accepted versions in `specs/001-application-foundation/research.md` before creating dependencies.
- [x] T002 Generate a strict browser-only Angular CLI workspace, app, domain library, and UI library in a temporary location; merge generated `angular.json`, `package.json`, `package-lock.json`, `tsconfig.json`, and `projects/` into this repository while preserving `.specify/`, `.agents/`, `AGENTS.md`, `README.md`, `docs/`, and `specs/`.
- [x] T003 Configure start/test/build scripts for the app in `package.json`, use CLI-supported Vitest/jsdom, record Node in `.nvmrc`, and document exact dependency versions without adding SSR entries or evaluation tools.

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 Create/export typed models in `projects/domain/src/lib/models/foundation.ts` and `projects/domain/src/public-api.ts`: IDs are "unique nonempty string"; required names/title are "nonempty string"; email is "valid email"; person/team/manager/supplier references exist; requester team equals requester's team; roles are "employee, manager, or administrator"; categories are "equipment, software, or service"; request states are "draft, submitted, approved, rejected, or fulfilled"; asset types are "equipment or software"; asset states are "available, assigned, maintenance, or retired"; dates are "valid ISO datetime"; assigned assets require an assignee and other seed statuses use null. Define preferences "light or dark" and "comfortable or compact"; query page is "positive integer", pageSize is "25, 50, or 100", with allowed sort values; scenario modes are "normal, empty, delayed, or error" and generation is an "increasing integer".
- [x] T005 Create deterministic seeds and a repository injection token in `projects/workplace-hub/src/app/core/mock-http/seed-data.ts` and `mock-repository.ts`; seed exactly 80 people, 12 teams, 40 suppliers, 250 requests, and 2,000 assets with valid references, fixed IDs/dates, immutable seeds, and at least one visible request/asset per demo identity.
- [x] T006 Register a terminal functional mock interceptor and baseline repository reads in `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts` and `app.config.ts`; implement the three GET contracts, explicit 403/404/405 errors, cancellation, and no forwarding of `/api/` calls to external services.

## Phase 3: User Story 1 - Navigate the Application (Priority: P1)

**Goal**: A usable shell and four initial route destinations with honest implementation status.
**Independent Test**: Navigate the four destinations, refresh direct links, and recover from an unknown path.

- [x] T007 [US1] Build semantic, keyboard-usable shell/navigation and basic shared styles in `projects/workplace-hub/src/app/shell/shell/` and `projects/ui/src/lib/styles/`; identify unfinished navigation items as planned and omit fake route targets.
- [x] T008 [US1] Configure root redirect and lazy feature routes in `projects/workplace-hub/src/app/app.routes.ts`; create Dashboard and clearly labeled initial Requests/Assets/Preferences page structures under `features/` with active navigation and titles, and derive Dashboard counts from the mock read contract.
- [x] T009 [US1] Add accessible not-found and access-denied helpers under `projects/workplace-hub/src/app/shell/`; verify navigation and direct-link fallback using `specs/001-application-foundation/quickstart.md` and record actual results in this task.

## Phase 4: User Story 2 - Explore Demo Roles and Records (Priority: P2)

**Goal**: Role-dependent records with searchable, sortable, paged lists.
**Independent Test**: Verify own/team/all visibility for the three seeded identities and each list.

- [ ] T010 [US2] Write focused visibility/session-switch checks in `projects/workplace-hub/src/app/core/session/session.spec.ts` and `core/mock-http/mock-repository.spec.ts`; confirm they fail for missing behavior before implementation, then verify they pass.
- [ ] T011 [US2] Implement three fixed demo identities, selected identity signal, persistence fallback, immediate stale-record clearing, and shell switcher in `projects/workplace-hub/src/app/core/session/session.ts` and `shell/shell/`; default to employee when saved identity is invalid.
- [ ] T012 [US2] Apply identity visibility before filtering/sorting/paging/counts in `projects/workplace-hub/src/app/core/mock-http/mock-repository.ts`; enforce all relationship and visibility rules in data-model.md and implement the deterministic sorting/query normalization contract.
- [ ] T013 [US2] Add HTTP-backed list services and query state in `projects/workplace-hub/src/app/features/requests/request-list.service.ts` and `features/assets/asset-list.service.ts`; use HttpClient for Requests and httpResource for Assets, synchronize URL queries, and cancel/ignore stale identity requests.
- [ ] T014 [US2] Complete read-only paged/searchable/sortable lists under `projects/workplace-hub/src/app/features/requests/` and `features/assets/`; display filtered totals and clear old records during identity transitions.

## Phase 5: User Story 3 - Restore and Inspect Application States (Priority: P2)

**Goal**: Normal, empty, delayed, failed, and reset behavior without stale responses.
**Independent Test**: Exercise every scenario, retry, and reset during a pending response.

- [ ] T015 [US3] Write reset/delay/stale-response checks in `projects/workplace-hub/src/app/core/scenarios/scenario.spec.ts` and `core/mock-http/mock.interceptor.spec.ts`; confirm missing behavior fails before implementation and verifies afterward.
- [ ] T016 [US3] Implement scenario mode/generation and seed reset in `projects/workplace-hub/src/app/core/scenarios/scenario.ts`; preserve identity/preferences and restore normal mode plus active list query defaults.
- [ ] T017 [US3] Implement 250 ms normal and 2,000 ms delayed responses, empty results, 503 error mode, and generation/cancellation safeguards in `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts`; retry restores normal mode without resetting records.
- [ ] T018 [US3] Add scenario/reset controls to `projects/workplace-hub/src/app/shell/shell/` and loading/empty/error/retry states to both list features; ensure the old generation never replaces current records.

## Phase 6: User Story 4 - Save Display Preferences (Priority: P3)

**Goal**: Persistent appearance/density choices with usable session-only fallback.
**Independent Test**: Save both choices, refresh, and exercise invalid/unavailable storage.

- [ ] T019 [US4] Write preference validation and storage-fallback checks in `projects/workplace-hub/src/app/core/preferences/preferences.spec.ts`; verify default "light and comfortable", enum rejection, refresh restoration, and session-only persistence failures.
- [ ] T020 [US4] Implement preference service and a template-driven FormsModule/ngModel settings page in `projects/workplace-hub/src/app/core/preferences/preferences.ts` and `features/preferences/`; apply appearance/density through shared styles, validate persisted values, and surface session-only feedback on failure.
- [ ] T021 [US4] Complete preference keyboard labels, focus, save feedback, and safe styling defaults in `projects/workplace-hub/src/app/features/preferences/` and `projects/ui/src/lib/styles/`; run the independent preference scenario and record results.

## Phase 7: Polish and Cross-Cutting Verification

- [ ] T022 Run unit tests, production build, and the browser/keyboard scenarios in `specs/001-application-foundation/quickstart.md`; record actual outcomes in `tasks.md`, fix failures, and verify that no SSR or external business API calls were introduced.
- [ ] T023 Update `README.md`, `docs/angular-coverage.md`, and `docs/implementation-roadmap.md` with working commands, completed foundation status, actual source locations, and limits; leave later patterns/features explicitly planned.

## Dependencies and Execution Order

Setup T001 → T002 → T003, then foundation T004 → T005 → T006. US1 depends on the foundation.
US2 uses the shell/list destinations from US1. US3 uses the lists from US2. US4 requires the
foundation and Preferences destination from US1; it may be implemented independently of US2/US3.
Polish follows all four stories. Tests with explicit pre-implementation checks precede their behavior.

## Parallel Opportunities and Examples

After foundation, US4 preference service/form work can proceed independently of US2 list work.
After US2 completes, US3 scenario tests and US4 preference tests touch separate files. Within US1,
the two helper-page views may be implemented independently after routing is agreed. Integration
changes to the shell, app.config.ts, or shared styles must be sequenced to avoid conflicts.

These are scheduling options, not a requirement for parallel agents.

## Implementation Strategy

Deliver US1 as the first visible increment; validate navigation before adding data interactions.
Then add role-filtered lists, reproducible states, and Preferences. Each story has an independent
validation scenario even where its integration depends on an earlier story. No deployment is
required. Keep all boxes unchecked until the described implementation and verification exist.

## Verification log

T009: Headless Chrome verified root redirect, all four routes, direct-link reloads, active
navigation, not-found/access-denied recovery, and keyboard skip link. No page errors occurred.
