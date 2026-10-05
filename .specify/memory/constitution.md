# Workplace Hub Constitution

## Core Principles

### I. Preserve Intentional Angular Variety

The application MUST contain working examples of typed Reactive Forms, Angular Signal Forms,
template-driven forms, decorator and signal inputs/outputs, NgModule and standalone components,
and RxJS and signal state. Each pattern MUST have an assigned business feature and an entry in
the coverage matrix. Refactoring MUST NOT eliminate an assigned pattern without an explicit
scope change. The project's usefulness depends on this deliberate variety.

### II. Deliver Coherent Business Workflows

Features MUST implement observable behavior using related requests, people, suppliers, and
assets. Shared domain policies MUST define state transitions and permissions. A working
request-to-asset workflow MUST precede expansion into every planned section. Incomplete
features MUST be identified rather than presented as functional screens.

### III. Keep the Application Reproducible

The application MUST run locally without production credentials or external business services.
Mock HTTP, deterministic seed data, demo identities, and scenario reset MUST reproduce the
same initial state. Loading, empty, failure, and permission states MUST be reachable. Demo role
switching MUST be described as application simulation rather than production authentication.

### IV. Maintain Clear Boundaries

Feature pages and state MUST depend on shared domain contracts and reusable UI; shared UI
MUST NOT contain business policy. Business features MUST be lazy-loaded. Each feature MUST
follow its assigned implementation profile. Dependencies MUST serve an identified application
requirement, with one pinned Angular major and a committed package lockfile after scaffolding.

### V. Verify Meaningful Behavior

Changes MUST receive verification appropriate to their impact. Domain policies, form validation,
custom form controls, mock reset behavior, and the principal workflow MUST receive focused
automated checks. Routed screens MUST provide usable keyboard interaction and applicable
loading, empty, error, and permission states. Documentation MUST distinguish completed work
from planned work; passing documentation checks MUST NOT be described as a working app.

## Application Constraints

- Browser-only SPA; no SSR, hydration, or server-rendered application entry points.
- Project directory: `/Users/avetrov/repos/workplace-hub`.
- Angular 22 is the planned baseline, with exact package versions and runtime compatibility
  checked before scaffolding. Use npm and strict TypeScript/template checking.
- Scope: Dashboard, Requests, Approvals, Assets, Suppliers, People and Teams, Reports,
  Administration, and user preferences.
- Design-system evaluation, alternate library comparisons, a Design System Lab, context graph
  MCP integration, graph datasets, and benchmarks are outside the implementation scope.
- Production authentication, real purchasing, payments, and a production backend are excluded.
- Default to zoneless. If Zone.js coverage is added, use a separate application configuration.
- Deprecated Angular APIs may be used only in designated examples that remain compatible
  with the pinned runtime and have their status documented.

## Development Workflow

Maintain a product overview, route map, architecture decisions, and Angular coverage matrix.
Use feature-sized Spec Kit specifications, plans, and dependency-ordered tasks. Detail the next
feature rather than generating the entire application at once. Check requirements and design
consistency before implementing cross-feature changes. Ordinary fixes and styling adjustments
do not require a new feature specification.

Each completed feature MUST document its assigned patterns and verification. Update coverage
entries with actual source locations only after those implementations exist.

## Governance

This constitution guides repository work subject to explicit user instructions. Amendments MUST
record the changed rule, rationale, impact on implementation and coverage, and amendment date.
Use semantic versioning: major for incompatible principle changes, minor for added obligations,
and patch for clarifications. Review feature plans and completed changes against these principles.
Do not infer additional approval gates from this document.

**Version**: 1.0.0 | **Ratified**: 2026-10-05 | **Last Amended**: 2026-10-05
