# Feature Specification: Request-to-Asset Workflow

**Feature Branch**: `main` (feature directory independent of branch)
**Created**: 2026-10-05
**Status**: Implemented and verified (14/14 tasks; evidence in tasks.md)
**Input**: Continue the agreed enterprise application with a complete request-to-asset workflow.

## User Scenarios & Testing

### User Story 1 — Create and track a request (Priority: P1)

An employee describes a workplace need, adds estimated line items and delivery details, saves a
valid draft, edits it, and submits it for review. They can inspect status and chronological history.
**Why this priority**: It starts the product's principal workflow.
**Independent Test**: Create a draft as Alex Garcia, inspect it, edit and submit it; verify its
contents, total, status and history without implementing approval or assignment actions.
**Acceptance Scenarios**:

1. Given an employee and valid details, saving a draft creates one owned request with a history entry.
2. Given an owned draft, editing and submitting preserves its ID and records both changes.
3. Given invalid delivery/items/cost, saving or submitting shows errors and creates no record.
4. Given unsaved changes, leaving offers a discard choice; cancel preserves the draft form.
5. Given another identity or a non-draft request, edit controls are unavailable and writes fail.

### User Story 2 — Review submitted requests (Priority: P2)

A manager filters and selects their team's submitted requests, then approves or rejects one.
**Why this priority**: It turns an employee's submission into an actionable decision.
**Independent Test**: Use a seeded submitted team request, approve it, and reject another with a
reason; verify removal from the queue and visible decision history.
**Acceptance Scenarios**:

1. The queue contains only submitted team requests the manager can review, excluding their own.
2. Approval changes a submitted request to approved; rejection requires a reason and records it.
3. Switching roles or filters reconciles selection and clears inaccessible records immediately.
4. Duplicate/stale decisions produce a conflict without a second history entry.

### User Story 3 — Create inventory and fulfill a request (Priority: P3)

An administrator creates an available inventory record and assigns a compatible available asset
to an approved request. The requester sees the asset and fulfillment history.
**Why this priority**: It completes the principal workflow.
**Independent Test**: Create an available asset, assign it to a seeded approved equipment/software
request, then verify both records and the requester's inventory.
**Acceptance Scenarios**:

1. Valid inventory creation creates one available unassigned asset with supplier and serial details.
2. Assignment atomically marks the asset assigned to the requester and the request fulfilled,
   links both IDs and records events on both records.
3. Assigned/retired/maintenance assets, incompatible categories, stale versions and duplicate
   fulfillment cannot change either record.
4. Only administrators may create or assign inventory; detail reads retain role visibility.

### Edge Cases

Invalid/missing IDs show recovery; forbidden reads/writes show permission feedback. A failed
response does not mutate data or lose form input. Reset/reload restores seed histories and IDs.
Reset or role change during a delayed write prevents its commit. Rapid repeated clicks create
one command. Direct links preserve permissions. A role change while already on a page clears
inaccessible content. Empty read scenarios never report a write as successful.

## Requirements

### Functional Requirements

- **FR-001**: Employees can create, save, edit and submit valid owned draft requests.
- **FR-002**: Requests capture title, justification, category, delivery and one to ten estimated items.
- **FR-003**: Validation covers required text, quantities, decimal cost and delivery date; totals use cents.
- **FR-004**: Request and asset detail pages show status, relationships and chronological audit history.
- **FR-005**: Managers can filter/select submitted team requests and approve or reject with a recorded reason.
- **FR-006**: Administrators can create available inventory and assign one compatible available asset to an approved request.
- **FR-007**: Permissions, transitions and optimistic record versions are enforced at commit time.
- **FR-008**: Fulfillment changes the linked asset/request atomically and cannot occur twice.
- **FR-009**: Unsaved request forms require a discard choice on navigation; successful save proceeds directly.
- **FR-010**: Loading/empty/error/retry states, keyboard controls and visible validation cover new pages.
- **FR-011**: Scenario reset and identity changes cancel pending writes, clear obsolete content and restore seed state.
- **FR-012**: All business data stays local; successful writes refresh affected views without a browser reload.

### Key Entities

Request details and estimated line items; delivery details; approval decision; inventory details;
asset/request allocation; audit event; current record version.

## Success Criteria

- **SC-001**: A valid new request completes draft → submitted → approved → fulfilled across the three identities.
- **SC-002**: Rejection records its reason and the request remains readable.
- **SC-003**: Invalid, forbidden, stale or duplicate commands leave both records and history unchanged.
- **SC-004**: Reset during a delayed write leaves the original record counts and no late mutation.
- **SC-005**: The new screens work by direct link and keyboard; unsaved navigation can be canceled.

## Assumptions

The foundation is available. Mutations are in memory and reset on reload. New requests support
equipment/software categories; existing service requests remain readable/reviewable but have no
inventory fulfillment action. One asset fulfills a demo request; estimated items describe budget,
not multiple inventory allocations. Valid drafts use the same field constraints as submissions.
Rejected requests are readable, with resubmission outside this slice. No bulk decisions, production
authentication/backend, SSR, evaluation tools, legacy Suppliers or Signal Forms are delivered here.
Focused policy, validation/custom-control and mutation checks plus browser workflow validation
are required before marking this feature complete.
