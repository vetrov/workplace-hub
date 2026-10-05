# ADR 0001: Application architecture

Date: 2026-10-05. Status: accepted and implemented across all business features. Completion audit in progress.

## Decision

Use an Angular CLI npm workspace with one browser-only application and focused `domain` and `ui`
libraries. Put simple design tokens in the UI library's styles. Lazy-load business features.
Use strict typing and one Angular 22 runtime; retain intentional older-pattern feature profiles.

Implemented source structure:

```text
projects/workplace-hub/src/app/
  shell/
  core/{session,mock-http,scenarios}/
  features/{dashboard,requests,approvals,assets,suppliers,people,teams,reports,administration,preferences}/
projects/domain/src/lib/{models,policies}/
projects/ui/src/lib/{components,styles}/
```

Dependencies: feature pages → feature services/state → domain contracts;
feature pages → reusable UI. Domain has no presentation dependency. UI has no business policy.

Default to standalone, signal-based state, modern template control flow, and zoneless scheduling.
Requests use typed Reactive Forms. Suppliers use NgModule, decorator APIs, constructor DI,
and RxJS state. Administration policies use Signal Forms. Preferences use template-driven forms.

Use an Angular functional HTTP interceptor to serve `/api/` requests from a deterministic
in-memory repository. Feature services still use HttpClient or selected resource read APIs.
Mock responses support delay, empty results, and failure. Unknown mock paths fail explicitly.
No business endpoint is forwarded to a remote server. Reset clears state and recreates seeds.

Session identity is browser-local simulation. Refresh restores seed data while local appearance,
density, and selected demo identity preferences may persist. In-flight responses from a previous
scenario generation must not overwrite a new scenario's state.

Start with semantic HTML and shared CSS styling. Add Angular CDK behaviors only for concrete
overlay, focus, or scrolling requirements. Do not introduce alternate UI libraries or tool comparisons.

The application uses Angular CLI-supported Vitest/jsdom with focused automated tests and isolated
Chrome verification of the principal workflow, keyboard operation, permission/unsaved guards and
pending-write cancellation. Browser checks used temporary isolated automation; committed unit
checks run through npm, and quickstart guides retain repeatable browser scenarios.

## Rationale

This keeps the initial runtime and infrastructure small while providing genuine HTTP, DI,
routing, form, and state examples. Libraries establish useful boundaries; feature profiles
provide variety without multiple Angular runtimes or a large shared services layer.

## Alternatives

- Multiple Angular versions in one running app: excessive setup for the current requirement.
- Nx: unnecessary until additional applications or build orchestration are needed.
- External mock server: adds a separate process without a current requirement.
- One universal facade hiding all Angular APIs: makes pattern coverage harder to inspect.

## Consequences

The mock backend is an application simulation, not a security boundary or production service.
The scaffold preserved planning and Spec Kit files by generating in a temporary directory
and merging workspace files. Exact versions are pinned with a lockfile: Angular 22.2.1,
TypeScript 6.0.3, RxJS 7.8.2, Node 22.23.2 and npm 10.9.8. Static hosting requires SPA
history fallback, not SSR.

## Workflow command extension

Domain contracts/policies define validation, edit/review permissions and versions. The mock
repository delegates detail/command storage to `core/mock-http/workflow-repository.ts` while
retaining the existing summary/list methods. Immutable replacement commits request/asset
allocation together after all checks. Audit events identify actual demo actors; reset restores
seed snapshots, versions, links and counters. Writes execute only after context checks inside
the cancellable mock timer. A scoped WorkflowClient provides single-flight/finalize state and
advances context after success so resource/list reads refresh. Active pages clear old context
content in addition to functional entry guards. CanDeactivate protects dirty and pending request, inventory creation/maintenance, supplier, policy,
team-transfer, report-configuration and organization editors.

## Enterprise and pattern extensions

AdministrationRepository and EnterpriseRepository extend the immutable workflow store with contacts,
policies, memberships, report definitions and versioned organization configuration. Known actors,
optimistic versions, record relationships and context checks remain at commit time. Current membership
controls asset visibility; historical request team IDs remain fixed. Reports scope every run/export before
applying saved filters, summarize all matches and render at most 100 rows. Category availability and
purchasing limits apply to future submissions; manager capability flags affect create/export commands.

Suppliers uses a feature-local DI class interceptor with withRequestsMadeViaParent. Reports resolve
first-navigation data as a cancelable Observable with error/EMPTY recovery; an input-bound page-local
resource refreshes after context changes and suppresses obsolete results immediately. Organization
summary caching and editor drafts are scoped to identity/reset; transient failures retain editable values.
UI owns generic CVAs/FormValueControl, typed projected table templates, display pipe and host region behavior.
The deferred chart has its own production chunk; dynamic Dashboard types remain inside the lazy Dashboard.
No new dependencies, external backend or alternate Angular runtime were introduced.

## Application completion

Shell focus follows successful path changes after rendering; query/fragment updates and initial load
retain focus, and feature-initialized fields take precedence. Pending render callbacks cancel on
replacement/failed/canceled navigation. Wizard and asset validation focus uses native-control IDs,
scoped view queries and current context checks. Successful writes release busy before saved-record
navigation; failed writes retain values. Asset supplier choices retain a loaded identity/reset-scoped
snapshot during transient failures.

Paged lists keep navigation buttons outside replaceable result views. aria-disabled and action guards
prevent unavailable/pending page changes while retaining the focused native button. Results still clear
at context boundaries and requested out-of-range pages use normalized results. Final tests, builds,
clean setup, routes, keyboard and coverage audit are recorded in docs/verification.md.
