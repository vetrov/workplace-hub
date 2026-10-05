# Workplace Hub: high-level implementation plan

## Current status

Milestones 0–3 are complete in `/Users/avetrov/repos/workplace-hub`. The browser-only Angular 22.2.1
SPA has 18 working business screens. Suppliers adds a lazy NgModule, decorator APIs, constructor DI,
RxJS facade and class interceptor; purchasing policies add real Signal Forms/schema/custom-control
integration and future submission limits. Supplier changes flow into inventory without reload.
All 23 foundation, 14 workflow and 8 coverage tasks are complete; implementation steps have local commits.
The 90-test suite, app/library builds and Chrome workflows, permissions/cancellation, keyboard/recovery
and 390px checks pass. Intentional old/new patterns and four-space formatting remain in place.
Next: implement the remaining 11 screens in Milestone 4, then complete the remaining Angular coverage,
accessibility/navigation and documentation audit in Milestone 5. Neither phase is complete yet.

## Purpose

Build a browser-only Angular enterprise application with a deliberate mix of established and modern Angular patterns. Use equipment requests, approvals, procurement, and asset management as the business domain.

The application should behave like a coherent product that has evolved over time. It can support future design-system and context graph experiments, but conducting those experiments is outside this implementation task.

## Recommendation: use Spec Kit, with a small workflow

Use GitHub Spec Kit for project principles and feature-sized specifications. Its documented process separates specification, technical planning, tasks, implementation, and convergence. Run this process for each business capability, rather than generating the whole application from one specification.

Source: [GitHub Spec Kit documentation](https://github.github.com/spec-kit/).

Start with one project constitution, a short product overview, an Angular coverage matrix, and an architecture decision record. Each feature then gets a specification, technical plan, and dependency-ordered task list. Use clarification and consistency checks where requirements are ambiguous or cross-feature changes are substantial.

The constitution must explicitly preserve intentional pattern diversity. Otherwise, implementation agents may reasonably consolidate the code into a single modern style and undermine the project's purpose.

Use ordinary development tasks for small styling changes and fixes. A full feature workflow is unnecessary for every component adjustment.

## Project principles

- Client-side rendering only; no SSR or hydration infrastructure.
- One pinned Angular runtime for the main application. The foundation pins Angular 22.2.1 after registry and runtime compatibility checks.
- Standalone shell and modern defaults, with explicitly designated older-pattern features.
- Reactive Forms, actual Angular Signal Forms, and one small template-driven form example.
- Decorator and signal component APIs, NgModule and standalone organization, and RxJS and signal state.
- Pattern coverage is tracked and cannot be removed accidentally during refactoring.
- Shared domain rules and deterministic data keep features consistent and reproducible.
- Reusable UI provides a coherent visual baseline across features.
- Mock HTTP, demo roles, and resettable scenarios make the app reproducible without external services.
- Feature specifications and implementation remain aligned through focused verification.

Angular references: [releases](https://angular.dev/reference/releases), [form systems](https://angular.dev/guide/forms/signals/comparison), [inputs](https://angular.dev/guide/signals/inputs), [NgModules](https://angular.dev/guide/ngmodules/overview).

## Application scope

Plan for approximately 20–30 routed screens across:

1. Dashboard: metrics, activity, pending work.
2. Requests: list, detail, create/edit wizard, comments.
3. Approvals: queue, review panel, bulk decisions.
4. Assets: inventory, details, assignment, maintenance.
5. Suppliers: directory, details, contacts, procurement history.
6. People and teams: directory, profiles, memberships.
7. Reports: saved views, report configuration, results.
8. Administration: policies, roles, categories, organization settings.

The first release uses employee, manager, and administrator demo roles. Production authentication and a production backend are outside the initial scope.

Design-system tool evaluation, alternative library integrations, a Design System Lab, context graph MCP integration, graph datasets, and evaluation benchmarks are outside this task. Shared UI and application styling remain part of ordinary application implementation.

## Implementation milestones

| Milestone                                | Work                                                                                                                                              | Completion evidence                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 0. Scope and architecture (complete)     | Product overview, constitution, route map, Angular coverage matrix, architecture decisions                                                        | Each required pattern has an owner and example; experimental and deprecated APIs are identified                                 |
| 1. Application foundation (complete)     | Angular workspace, SPA routing, shell, domain contracts, reusable UI, application styling, mock HTTP, seeded data, role switching, scenario reset | App runs locally; lazy navigation, roles, and deterministic reset work                                                          |
| 2. Complete business workflow (complete) | Reactive request wizard, signal-based approval queue, asset creation/assignment, shared policy rules, audit history                               | Create → approve/reject → assign works end to end; validation, failures, and permissions are observable                         |
| 3. Angular pattern coverage (complete)   | NgModule-based Suppliers, decorator APIs, RxJS facade, Signal Forms policy editor, template-driven preferences, custom controls                   | Coverage matrix points to working examples; forms, controls, and state transitions behave correctly                             |
| 4. Enterprise breadth                    | People, reports, remaining administration pages, saved filters, bulk actions, deferred views, larger datasets                                     | Remaining sections share realistic data and reusable patterns; major routes expose loading, empty, error, and permission states |
| 5. Application completion                | Navigation and accessibility review, focused automated tests, build checks, setup documentation, coverage audit                                   | App builds successfully; key workflows pass; required Angular patterns are implemented and documented                           |

## Architecture and implementation profiles

The project is initialized at `/Users/avetrov/repos/workplace-hub` (`~/repos/workplace-hub`).

The Angular CLI workspace contains one application and focused `domain` and `ui` libraries.
Design tokens live in UI styles; testing utilities can be added when a concrete need arises. Lazy-load business features. Features own their pages, state, and data services; shared UI contains no business policy.

Assign profiles deliberately:

| Feature               | Primary profile                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Suppliers             | NgModule, decorator inputs/outputs, constructor injection, RxJS service state                              |
| Requests              | Implemented typed Reactive Forms, nested groups/arrays, money ControlValueAccessor and HTTP mutations      |
| Approvals and Assets  | Standalone components, signal inputs/outputs, computed state, functional DI, selected resource-based reads |
| Administration        | Signal Forms, schema validation, signal-compatible custom controls                                         |
| Preferences           | Small template-driven form (implemented in foundation)                                                     |
| Reports and Dashboard | Deferred content, dynamic widgets, template composition                                                    |

Add query APIs, route guards/resolvers, provider scopes, HTTP interceptors, content projection, custom directives, pipes, lifecycle hooks, and dynamic rendering to the coverage matrix. These are assigned during detailed planning rather than forced into every feature.

If both Zone.js and zoneless modes are included in the agreed Angular coverage, provide separate application configurations. Do not attempt to select the change-detection scheduler by route. Recheck deprecated API availability when upgrading Angular.

References: [zoneless configuration](https://angular.dev/api/core/provideZonelessChangeDetection), [NgIf deprecation](https://angular.dev/api/common/NgIf).

## Application verification

Verify domain policies, reactive and signal form validation, custom-control integration, and the request-to-asset workflow. Check navigation, permissions, keyboard operation, loading/empty/error states, and a production build.

Audit the Angular coverage matrix against the completed code. Record the location and purpose of each pattern so future refactoring preserves the intended variety.

## Initial feature specification sequence

1. Application foundation and reproducible scenarios.
2. Request-to-asset workflow.
3. Legacy Suppliers and Angular pattern coverage.
4. People, reporting, and administration.
5. Application completion and documentation.

Keep this roadmap as the project overview. Detail only the next feature's implementation tasks, updating later specifications as real integration constraints emerge.

## First usable milestone

The shell, mock HTTP/reset, reactive request wizard, signal-based approvals, inventory workflow,
NgModule Suppliers, template-driven preferences and actual Signal Forms purchasing policies are delivered.
Expand the enterprise sections and remaining coverage next, retaining all delivered profiles.
