# Tasks: Request-to-Asset Workflow

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/workflow.md and quickstart.md.
**Status**: 11/14 tasks complete; implementation in progress.

## Phase 1: Setup

- [x] T001 Add typed request/detail/item/delivery/command/audit contracts and shared constraint constants in `projects/domain/src/lib/models/workflow.ts` and export from `projects/domain/src/public-api.ts`; preserve foundation summaries. Constraints: title "3–100 trimmed characters", justification "10–2,000 trimmed characters", location "3–120 trimmed characters", date "valid YYYY-MM-DD calendar date", items "1–10 items", description "3–120 trimmed characters", quantity "integer 1–100", unitCost "0.01–100,000 with at most two decimal places", inventory name "3–100 trimmed characters", serial "3–80 trimmed characters", notes "0–1,000 characters", new category/type "equipment or software", supplier "existing supplier ID", reason reject "3–500 trimmed characters"/approve "0–500 trimmed characters", versions "positive integer".

## Phase 2: Shared Workflow Foundation

- [x] T002 Write focused workflow command tests in `projects/workplace-hub/src/app/core/mock-http/workflow.spec.ts` for validation, actor scope, transitions, optimistic versions, atomic assignment, duplicate attempts, linked audit and reset; confirm missing behavior fails before implementation.
- [x] T003 Implement shared validators/permissions in `projects/domain/src/lib/policies/workflow.ts` and enriched immutable seeds, request/detail/create/update/decision/inventory/assignment repository commands in `projects/workplace-hub/src/app/core/mock-http/mock-repository.ts`; pass T002 checks with no partial writes.
- [x] T004 Write HTTP command scenario checks in `projects/workplace-hub/src/app/core/mock-http/workflow-http.spec.ts` for failed/empty writes, unsubscribe, reset/identity cancellation and stale commands; confirm failures before extending transport.
- [x] T005 Extend checked/cancellable synthetic transport in `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts`; add generation refresh to `core/scenarios/scenario.ts` and scoped single-flight/finalize mutation client in `core/workflow-client.ts`; preserve existing read tests and pass command tests.

## Phase 3: US1 — Create and Track a Request (P1)

Goal: a complete employee create/edit/submit/details slice. Independent test: valid draft → edit → submit, visible history and invalid/unsaved feedback.

- [x] T006 [US1] Write meaningful nested request validation and custom-control write/change/touched/disabled checks in `projects/workplace-hub/src/app/features/requests/request-form.spec.ts` and `money-input.spec.ts`; confirm missing behavior fails.
- [x] T007 [US1] Implement typed request FormGroup/nested delivery/FormArray factory in `projects/workplace-hub/src/app/features/requests/request-form.ts` and generic money ControlValueAccessor/Validator in `projects/ui/src/lib/components/money-input.ts`; export UI control and pass T006 tests.
- [x] T008 [US1] Build three-step reactive wizard in `projects/workplace-hub/src/app/features/requests/request-wizard.ts` and `.html`, with repeated rows, validation summary, totals, draft/save/submit, edit loading/errors, cancellation and zoneless form updates.
- [x] T009 [US1] Build resource-backed detail/history and owned-draft actions in `projects/workplace-hub/src/app/features/requests/request-detail.ts` and `.html`; react to context and role changes without stale content.

## Phase 4: US2 — Review Submitted Requests (P2)

Goal: manager queue and review. Independent test: seeded decisions and queue selection reconciliation.

- [x] T010 [US2] Build `projects/workplace-hub/src/app/features/approvals/approvals.ts`, `.html`, `approval-actions.ts`, and `approval-filter.ts` with linkedSignal ID selection, signal inputs/output, real model two-way filtering, reasons, detail review, states and single-flight commands.

## Phase 5: US3 — Create Inventory and Fulfill (P3)

Goal: inventory creation/details/assignment. Independent test: seeded approved request assigned to new asset atomically.

- [x] T011 [US3] Build inventory creation and resource-backed detail/assignment pages in `projects/workplace-hub/src/app/features/assets/asset-create.ts`, `asset-detail.ts` and `.html`, with validation, compatible request selection, history, cancellation and role-aware controls.

## Phase 6: Integration and Verification

- [ ] T012 Add lazy routes/functional entry and request CanDeactivate guards in `projects/workplace-hub/src/app/app.routes.ts` and `core/workflow-guards.ts`; integrate real list/detail/new/approval navigation and responsive shared workflow styles in `projects/ui/src/lib/styles/_foundation.scss`.
- [ ] T013 Run unit/app/library builds and browser scenarios in `specs/002-request-asset-workflow/quickstart.md`; verify complete create → approve → assign and rejection, controls, permission/unsaved behavior and cancellation; fix issues and record actual evidence in `tasks.md`.
- [ ] T014 Update `README.md`, `AGENTS.md`, `docs/angular-coverage.md`, `docs/route-map.md`, `docs/implementation-roadmap.md` and this feature's status with working behavior, actual pattern sources and remaining scope.

## Dependencies and Parallel Opportunities

T001 → T002 → T003 → T004 → T005. T006 → T007 follow infrastructure; T008 → T009
complete US1; T010 and T011 consume the same infrastructure and are separate page files but
integration in T012 is sequential. T013/T014 follow all stories. Tests precede corresponding
implementation. Scheduling opportunities do not require parallel agents. Commit each completed
step locally, including specification preparation and focused fixes.

## Implementation Strategy

Preserve the working foundation. Introduce shared invariants first, then the employee slice,
manager decisions and administrator fulfillment. Verify each task before marking complete.

## Verification Log

Pending implementation evidence.
