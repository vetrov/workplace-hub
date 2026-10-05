# Implementation Plan: Application Foundation

**Branch**: `main` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-application-foundation/spec.md`.
The active feature directory is independent of the Git branch; no Git extension is enabled.

## Summary

Scaffold one Angular SPA, then deliver a usable shell, four initial sections, demo identity
selection, role-filtered seeded lists, reproducible scenarios, and personal display preferences.
Preserve the project documents and Spec Kit configuration when generating workspace files.
Business mutations and the full request workflow are separate features.

## Technical Context

**Language/Version**: TypeScript 6.0.3, pinned after CLI compatibility verification.
**Primary Dependencies**: Angular framework/CLI 22.2.1, RxJS 7.8.2, npm 10.9.8; exact direct
dependencies and generated lockfile committed. Registry publication and compiler peers verified.
**Storage**: In-memory business repository; localStorage for optional identity/display persistence.
**Testing**: CLI-supported Vitest/jsdom unit tests; manual browser navigation/keyboard checks for this slice.
**Target Platform**: Modern browsers supported by Angular 22; static/development hosting with SPA fallback.
**Project Type**: Browser-only SPA in a multi-project Angular CLI workspace.
**Performance Goals**: Bounded list rendering through paging; no evaluation or performance benchmark work.
**Constraints**: No SSR, production authentication/backend, external business calls, or evaluation tooling.
**Scale/Scope**: Four initial sections; seeded 80 people, 12 teams, 40 suppliers, 250 requests, 2,000 assets.
**Local Runtime**: Node 22.23.2 and npm 10.9.8 satisfy the documented Angular 22 Node requirement.

## Constitution Check

Pre-research and post-design checks pass:

- Intentional variety: foundation provides modern shell/state and template-driven preferences;
  Reactive Forms, Signal Forms, and legacy Suppliers remain explicitly assigned to later features.
- Coherent workflow: foundation supplies related records; workflow mutations are not falsely claimed complete.
- Reproducibility: mock HTTP, seed/reset, role selection, failure and delay states are first-class requirements.
- Boundaries: domain and UI libraries; lazy features; shared UI contains no business policy.
- Verification: focused checks for visibility, reset/stale responses, and persistence fallback; build and browser checks.
- Scope: no SSR, Design System Lab, tool comparisons, MCP integration, graph datasets, or benchmarks.

No constitution violations or unresolved technical decisions remain. Package installation,
compiler peer compatibility, tests and production builds passed during implementation.
See tasks.md for actual verification evidence.

## Project Structure

### Documentation (this feature)

```text
specs/001-application-foundation/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/foundation.md
  quickstart.md
  checklists/requirements.md
  tasks.md
```

### Source Code (implemented foundation)

```text
projects/workplace-hub/src/
  main.ts
  styles.scss
  app/
    app.ts
    app.config.ts
    app.routes.ts
    shell/{shell,not-found,access-denied}/
    core/session/
    core/mock-http/
    core/scenarios/
    core/preferences/
    features/{dashboard,requests,assets,preferences}/
projects/domain/src/lib/models/
projects/ui/src/lib/{components,styles}/
```

**Structure Decision**: Application infrastructure stays under core, routed pages under features,
cross-feature data types under domain, and presentation primitives under UI. Follow generated CLI
file conventions while preserving these boundaries; update task paths if generation differs.

## Delivery Design

Generate an empty CLI workspace in a temporary directory and create the application and domain/UI
libraries there. Merge only generated workspace files into the existing repository without overwriting
README, AGENTS, docs, specs, or Spec Kit assets. Explicitly configure browser-only routing and SCSS.

Register a terminal functional HTTP interceptor for `/api/` requests. It returns cancellable synthetic
responses from the seeded repository and fails unrecognized API paths. Business calls never reach
a remote backend. Earlier interceptors still participate; browser Network tools do not show these
synthetic requests. UI services use Angular HTTP APIs rather than calling the repository directly.

Register a repository injection token backed by the in-memory implementation. Query sorting/filtering,
paging, and identity visibility apply before returning records. Session/scenario generations invalidate
old responses. Both caller cancellation and generation checks protect against stale data.

Persist identity and appearance/density preferences separately from business data. Use safe validation
and storage fallbacks. Keep scenario reset available in the shell; it preserves identity/preferences
while restoring seeds, normal responses, and active list query defaults.

UI is semantic HTML with one styling baseline. Preference inputs use FormsModule/ngModel; shell and
list state use signals and modern control flow. Add no component-comparison or evaluation infrastructure.
