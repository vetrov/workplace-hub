# ADR 0001: Application architecture

Date: 2026-10-05. Status: accepted for planning; exact dependency versions require scaffold preflight.

## Decision

Use an Angular CLI npm workspace with one browser-only application and focused `domain` and `ui`
libraries. Put simple design tokens in the UI library's styles. Lazy-load business features.
Use strict typing and one Angular 22 runtime; retain intentional older-pattern feature profiles.

Planned source structure:

```text
projects/workplace-hub/src/app/
  shell/
  core/{session,mock-http,scenarios}/
  features/{dashboard,requests,approvals,assets,suppliers,people,teams,reports,administration,preferences}/
projects/domain/src/lib/{models,policies}/
projects/ui/src/lib/{components,directives,pipes,styles}/
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

Use the Angular CLI-supported unit test runner at scaffold time and focused browser validation.
Introduce browser automation for the principal workflow when it exists, not for documentation.

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
Scaffolding into this non-empty repository must preserve planning and Spec Kit files; generate
in a temporary directory and merge only generated workspace files. Pin exact versions after
checking Angular's compatibility table and the installed runtime. Static hosting requires SPA
history fallback, not SSR.
