# Product overview

## Goal

Create a medium-size enterprise Angular SPA containing multiple generations of Angular patterns
within coherent business features. Future tool experiments are possible uses of the application,
not deliverables of this implementation.

## Users

- Employee: view personal requests and assigned assets; create and edit draft requests.
- Manager: review submitted requests belonging to their team; approve or reject with a reason.
- Administrator: manage inventory, assignments, suppliers, people, categories, and policies.

Use fixed demo identities selected by a role switcher. Permissions are simulated business behavior,
not production authentication or a server-enforced security boundary.

## Primary workflow

An employee saves or submits an equipment request. A manager approves or rejects it. An
administrator assigns an available asset to the requester, fulfilling an approved request.
The request detail shows the associated asset and audit history.

Request states: draft → submitted → approved → fulfilled, or submitted → rejected.
Rejected requests remain readable; editing/resubmission is outside the first workflow slice.
An asset cannot be assigned to two people simultaneously. Fulfilled requests cannot be fulfilled twice.

## Application sections

Dashboard; Requests; Approvals; Assets; Suppliers; People and Teams; Reports; Administration;
and personal preferences. All 29 business screens and 31 required Angular patterns are implemented,
including the end-to-end request-to-asset workflow and enterprise reporting/administration.
The final application verification/navigation/accessibility/documentation audit is in progress.
Current form/category and one-asset allocation limits are documented in the workflow specification.

## Reproducibility

Use deterministic seeded records and reset controls. Foundation data: 80 people, 12 teams,
40 suppliers, 250 requests, and 2,000 assets. Records have valid relationships and illustrative
statuses. Empty, delayed, and failed responses are selectable demo scenarios. Refresh resets
business data; role, appearance, and density preferences may persist separately.

The enterprise seed adds four saved reports, three purchasing policies, three category configurations,
manager report flags and organization defaults. These are deterministic implementation defaults,
not performance benchmarks. Team membership changes affect current asset visibility; prior requests
retain their historical team. Reports store filters and recompute authorized totals/export on every run.

## Scope boundaries

In scope: SPA navigation, realistic workflows, mock HTTP, forms, permissions, reusable UI,
keyboard interaction, meaningful verification, and documented Angular pattern coverage.

Out of scope: SSR, real authentication, a production backend, payments, actual purchasing,
design-system tool evaluation, alternative library comparisons, a Design System Lab, context
graph MCP integration, graph datasets, and evaluation benchmarks.

## Delivery order

Foundation → request-to-asset workflow → older and newer Angular coverage → enterprise breadth
→ application verification and documentation.
