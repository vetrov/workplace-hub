# Feature Specification: Application Completion

**Feature Branch**: main
**Created**: 2026-10-06
**Status**: Specified
**Input**: Complete all remaining roadmap phases, preserve Angular variety, and commit each step locally.

## User Scenarios & Testing

### US1 — Keep work safe while navigating (Priority: P1)

Employees and administrators can leave untouched editors, choose whether to discard unsaved work,
and remain on an editor while its save is pending.
**Why this priority**: Navigation must not silently lose work or interrupt a save.
**Independent Test**: Change a new asset, cancel/discard leaving; attempt leaving a delayed request
save and observe it remain until the successful save opens the details page.
**Acceptance Scenarios**:

1. Given a pristine request or new asset, when leaving, then navigation succeeds without confirmation.
2. Given dirty inputs, when leaving, then cancel retains the inputs and discard permits navigation.
3. Given a pending request or asset creation, when leaving, then the editor remains without a discard dialog;
   successful completion still opens the saved record.
4. Given failure, identity change or reset, then failed inputs can be retried and obsolete drafts/pending work clear safely.

### US2 — Move through the application by keyboard (Priority: P1)

Users receive useful focus when changing pages or request steps and can find fields needing correction.
**Why this priority**: The completed application must support practical keyboard operation.
**Independent Test**: Activate a main-navigation link using the keyboard, use the skip link,
then proceed through request details/items/review and return to correct an invalid field.
**Acceptance Scenarios**:

1. When changing to a different page, focus moves to its content after rendering. Existing editor initial focus remains useful.
2. Changing list filters or page query parameters does not steal focus from the active control.
3. Moving forward/back between request steps focuses the first relevant control or review heading;
   validation focuses the first invalid field, including the custom money input.
4. All planned pages have a meaningful title, one main content landmark, labeled interactive controls,
   visible keyboard focus, and usable layouts at 390px. Applicable recovery/permission states remain usable.

### US3 — Run and understand the completed project (Priority: P2)

A developer can install the pinned dependencies, run the browser application, find all implemented
features/patterns and reproduce its important workflows and demo states.
**Why this priority**: The project must be a reproducible, documented Angular example.
**Independent Test**: Follow README setup, run tests/production and library builds, inspect coverage
source links and repeat the documented employee-to-inventory workflow.
**Acceptance Scenarios**:

1. All 29 business screens and 31 required Angular patterns have existing source and accurate documentation.
2. Request-to-asset, Suppliers, purchasing policies and enterprise cross-feature stories pass regression checks.
3. Pinned setup, formatting, tests, application/library builds and browser-only production navigation pass.
4. Documentation records completion, verification, in-memory reset behavior and intentional older/newer API profiles.

### Edge Cases

Canceled or denied navigation must retain focus. A successful save releases its pending state before
navigating. Query-only search/pagination must not cause unexpected focus changes. Background HTTP
refresh must not steal focus. A wizard step may disappear before its focus callback; callbacks must
operate only on the currently rendered view. Reset/identity changes cancel writes without storing
obsolete data. Full-page reload intentionally restores business seeds while local preferences persist.

## Requirements

### Functional Requirements

- **FR-001**: Request and new-asset editors protect dirty and pending navigation consistently with existing editors.
- **FR-002**: Invalid input and wizard-step changes provide useful, render-safe keyboard focus.
- **FR-003**: Page navigation and skip navigation provide content focus without stealing focus during filtering/refresh.
- **FR-004**: Review all 29 planned screens for direct navigation/reload, titles, labels, recovery and narrow layouts.
- **FR-005**: Preserve all 31 assigned patterns, deterministic roles/reset and existing connected workflows.
- **FR-006**: Complete focused automated/browser regressions and production/library/format checks without adding dependencies.
- **FR-007**: Publish accurate local setup/feature/coverage/verification documentation and complete the roadmap.

### Key Entities

No new business entities. Existing editor dirty/pending state, route identity and request-step state
control navigation and focus. Existing seed data and configuration contracts remain unchanged.

## Success Criteria

- **SC-001**: Both repaired editors pass pristine/dirty/pending/failure/reset/identity navigation scenarios.
- **SC-002**: Keyboard checks demonstrate content/skip focus and all request step/invalid-control focus;
  query changes preserve active-control focus.
- **SC-003**: All 29 planned screens pass final route/title/label/390px checks, with no uncaught runtime errors.
- **SC-004**: Principal business regressions, automated tests, production/library builds and formatting pass;
  all 31 coverage entries point to existing working source.
- **SC-005**: Setup and completion documentation match verified results; every completed step has a local commit.

## Assumptions

Finish the existing application without new product scope. No SSR, backend, production authentication,
external services, deployment, push/PR, evaluation tools or dependencies. Keep current main branch.
Application audit is a bounded practical review, not a certification of accessibility compliance.
