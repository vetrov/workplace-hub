# Tasks: Application Completion

Input: spec, plan, research, data model, UI contract and quickstart. Checklist 16/16 passes.

## Phase 1: Setup

- [x] T001 Specify/design/research final audit, initialize artifacts and check constitution.

## Phase 2: US1 — Editor safeguards

- [x] T002 Test and repair RequestWizard/AssetCreate pending/dirty guards, valid-form gates, asset options recovery and assets/new route guard. Verify save/failure/retry/reset/identity behavior.

## Phase 3: US2 — Keyboard navigation

- [x] T003 Implement/test render-safe Shell navigation focus and request wizard/asset invalid/step focus; preserve legacy focus and query interactions; remove unused planned navigation loop.

## Phase 4: US3 — Final verification

- [x] T004 Audit all 29 business routes, helper pages, keyboard/labels/titles/390px, preferences, response states and principal workflow regressions. Run full tests/app/library builds/format; verify pinned setup and all 31 source coverage entries. Fix any observed defects and record concrete evidence.

## Phase 5: Completion

- [x] T005 Write docs/verification.md, update README/AGENTS/roadmap/coverage/routes/product/architecture completion evidence, complete feature tasks/spec and run convergence. Confirm clean locally committed repository.

Dependencies: T001→T002→T003→T004→T005. Source/tests execute sequentially; independent browser checks may run concurrently.
Every completed task receives a local commit on main. No push/PR/deployment. No extra dependencies or product scope.

## Evidence

T001: Requirements checklist 16/16; two read-only research agents confirm pinned guard/render/router integration. Constitution pre/post-design checks pass. Existing workflow, Suppliers and policies regressions pass after enterprise integration; feature 004 convergence has zero findings (10 FR, 4 SC, 20 acceptance scenarios, 9 tasks, 5 principles).

T002: 138 tests across 32 files and production build pass. Production Chrome verifies both pristine/dirty cancel-discard, unchanged-input failed-save retries, cached supplier recovery, pending navigation without dialogs and successful saved-record navigation. Identity/reset cancels pending writes; no duplicate mutations.

T003: 143 tests across 33 files and production build pass (403.74kB raw /113.58kB transfer). Production Chrome verifies native skip/page/recovery focus, persistent query-control focus, invalid native money and asset inputs, forward/back/review steps, denied navigation, record-ID reuse and preserved legacy Supplier initial/edit focus. Pending render callbacks cancel on navigation/context changes.

T004: Final audit passes all 29 production direct routes/reloads at 1440px and 390px, two recovery routes, labels/landmarks/titles/unique IDs and representative dark/compact settings. Audit-driven repair preserves all four paged-list controls with aria-disabled/action guards and normalized bounds. Principal request-to-asset/Suppliers/policies and enterprise/state/permission/cancellation regressions pass. Clean offline lockfile install reproduces 143 tests/33 files, app (403.82kB/113.61kB transfer), both libraries and format checks; all 31 coverage entries resolve to working source. No SSR/external business calls.

T005: Completion documentation records verified setup, all routes/patterns and exact test/build evidence. Final source and behavior satisfy the bounded feature; convergence assessment follows.

## Phase 6: Convergence

- [x] T006 Correct the stale completion status in docs/architecture/0001-app-architecture.md and verify current completion documentation is consistent per FR-007 and T005 (partial, LOW).

T005: Setup/feature/route/coverage/architecture documents and final verification report are complete. Formatting, local documentation links, 31 coverage entries and 68 source references pass. Convergence checked 7 FRs, 5 SCs, 12 acceptance scenarios, 5 tasks and 5 principles; one LOW partial documentation header finding appended as T006. No implementation gaps.

T006: Architecture header now records the completed audit date. Current README/AGENTS/docs statuses match verified results; formatter and documentation checks pass. Documentation-only correction; app source and prior 143-test/build/browser evidence are unchanged.
