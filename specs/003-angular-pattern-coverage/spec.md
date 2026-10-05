# Feature Specification: Suppliers and Purchasing Policies

**Feature Branch**: `main` (feature directory independent of branch)
**Created**: 2026-10-05
**Status**: Ready for implementation
**Input**: Continue Milestone 3 of the agreed Workplace Hub roadmap.

## User Scenarios & Testing

### User Story 1 — Find a supplier (Priority: P1)

An administrator searches the supplier directory and inspects contacts and linked inventory.
**Why this priority**: Existing inventory already references suppliers; this makes those relationships usable.
**Independent Test**: Find a seeded supplier, open its details, and follow a linked asset.
**Acceptance Scenarios**:

1. The directory shows seeded suppliers and supports searchable, paged query URLs.
2. Details show contact information and inventory supplied by that organization.
3. Employees and managers cannot view supplier contacts; identity changes clear them immediately.
4. Missing records and loading, empty and failed responses expose recovery actions.

### User Story 2 — Maintain supplier contacts (Priority: P2)

An administrator creates a supplier and edits its contact information, then selects it for new inventory.
**Why this priority**: It connects procurement maintenance to the delivered request-to-asset workflow.
**Independent Test**: Create a supplier, edit its email and create an asset using that supplier.
**Acceptance Scenarios**:

1. Valid creation saves one supplier; valid editing preserves its ID and advances its version.
2. Invalid names, contact names, emails or notes show errors without changing stored records.
3. Duplicate names and stale edits show a conflict without overwriting another supplier.
4. Unsaved navigation offers discard/cancel; pending saves prevent duplicate submissions.
5. Reset and identity changes cancel pending saves and restore original data.

### User Story 3 — Configure purchasing limits (Priority: P3)

An administrator edits a category purchasing policy and observes its effect on future request submissions.
**Why this priority**: It adds an operational administration feature with a distinct editing approach.
**Independent Test**: Lower the equipment limit, attempt an over-limit submission, disable the policy and retry.
**Acceptance Scenarios**:

1. The policy list shows three seeded records; an editor changes name, category, maximum total, notes and enabled state.
2. Required fields, trimmed text and valid category/cost constraints show field errors and an error summary.
3. Successful saving advances the version and displays the saved values; stale edits cannot overwrite them.
4. An enabled policy rejects a new submission above its category limit; drafts and existing approved records remain usable.
5. Disabling a policy removes that constraint from later submissions; reset restores seeded limits.
6. Keyboard operation, dirty navigation, empty/failure recovery and identity/reset cancellation work in the editor.

### Edge Cases

An identity can change on an already-open screen. Delayed results must not display obsolete contacts or commit old saves.
Canceling navigation keeps the user's edits. Failed saves retain inputs. Missing IDs recover to the relevant list.
A newly created supplier is immediately available for inventory creation; supplier renaming updates asset labels.
Concurrent saves and stale versions do not create duplicate records. Multiple enabled policies in one category
apply the lowest limit. Programmatic record loading must not mark an editor dirty.

## Requirements

### Functional Requirements

- **FR-001**: Administrators can search, page and inspect supplier contacts and related inventory.
- **FR-002**: Administrators can create and update valid supplier records with unique names and conflict checks.
- **FR-003**: Supplier changes are visible to inventory creation and supplier labels without reload.
- **FR-004**: Administrators can list and edit three purchasing policies with category, maximum total, notes and enabled state.
- **FR-005**: Enabled category policies validate future submitted requests at commit time; drafts are permitted above a limit.
- **FR-006**: Invalid or unauthorized commands and stale versions leave data unchanged.
- **FR-007**: All screens support loading, empty, failure and permission states, keyboard use and 390px layouts.
- **FR-008**: Unsaved edits require discard/cancel; reset/identity changes cancel writes and clear stale editor data.
- **FR-009**: Business data remains deterministic and in memory, with existing scenarios and reset behavior.
- **FR-010**: Focused automated checks verify validation, conflicts, policy effects, form controls and principal supplier/policy flows.

### Key Entities

Supplier: identity, unique organization name, contact name/email, optional phone/notes and record version.
Purchasing policy: identity, name, request category, maximum estimated total in euros, enabled state, notes and version.
Existing requests and assets retain their owners, supplier relationships, status and audit history.

## Success Criteria

- **SC-001**: All six new business screens can be visited directly with the appropriate identity.
- **SC-002**: Supplier create → edit → inventory selection works without reload and creates exactly one record per save.
- **SC-003**: Policy change → rejected over-limit submission → disable policy → successful submission works.
- **SC-004**: Invalid, forbidden, stale and canceled commands preserve existing records.
- **SC-005**: Keyboard and 390px checks pass for the new screens; existing principal workflow still passes.

## Assumptions

Supplier and policy administration is administrator-only. Supplier names remain visible in authorized inventory
screens without exposing contacts. Supplier deletion, purchase orders and policy creation/deletion are later work.
Only equipment/software can be requested in the existing wizard; service policies remain configurable for future use.
Limits apply when submitting new/editable draft requests; they do not revise previous decisions or allocations.
Multiple enabled category policies combine by minimum limit. All changes are session-local and resettable.
