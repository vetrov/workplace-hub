# Workplace Hub

Browser-only Angular enterprise application with intentionally varied Angular patterns.
The business domain is equipment requests, approvals, suppliers, and asset management.

## Current implementation

The application foundation is implemented and verified: Dashboard, read-only Requests and Assets,
and Preferences. The shell includes demo identity switching, normal/empty/delayed/error responses,
and deterministic reset. Both lists support search, sort, paging, and query URLs. Preferences use
an actual template-driven form, with light/dark appearance and comfortable/compact density.

The remaining enterprise screens and request-to-asset workflow are planned. Reactive Forms,
Signal Forms, NgModule-based Suppliers, and decorator component APIs arrive in later features.
See the [coverage matrix](docs/angular-coverage.md) for working examples and remaining patterns.
Design-system evaluation and context graph evaluation/integration are outside this task. No SSR.

## Run locally

Use Node 22.23.2 (`.nvmrc`) and npm 10.9.8. Dependencies are pinned and locked.

```sh
cd ~/repos/workplace-hub
npm ci
npm start
```

Open http://localhost:4200. Angular framework/CLI: 22.2.1; TypeScript: 6.0.3; RxJS: 7.8.2.

```sh
npm test -- --watch=false
npm run build
npm run build:libs
```

The unit suite has 22 focused checks. Production output is `dist/workplace-hub/browser`;
static hosting must provide SPA history fallback. Domain and UI builds output to `dist/domain`
and `dist/ui`. See [the validation guide](specs/001-application-foundation/quickstart.md)
and [recorded results](specs/001-application-foundation/tasks.md).

## Explore the demo

| Identity | Scope | Seeded request / asset totals |
| --- | --- | --- |
| Alex Garcia · Employee | Own requests and assigned assets | 3 / 6 |
| Alex Chen · Manager | Team requests and assigned assets | 22 / 44 |
| Taylor Patel · Administrator | All records | 250 / 2,000 |

The related seed also contains 80 people, 12 teams, and 40 suppliers. The terminal functional
HTTP interceptor returns synthetic responses inside the app; no separate backend runs and these
requests do not appear as real browser network traffic. Demo permissions simulate application
behavior. Identity and display choices persist when localStorage is available; business data is
in memory and recreated on reload. Reset restores seeds, normal responses, and the active list's
query defaults while preserving identity and display choices. Retry restores normal responses.

## Structure and planning

- `projects/workplace-hub`: standalone shell, lazy feature pages, and local infrastructure.
- `projects/domain`: shared contracts, query normalization, and visibility rules.
- `projects/ui`: reusable status badge and shared styles, without business policy.
- [Project constitution](.specify/memory/constitution.md)
- [Product overview](docs/product-overview.md)
- [Implementation roadmap](docs/implementation-roadmap.md)
- [Route map](docs/route-map.md)
- [Architecture decision](docs/architecture/0001-app-architecture.md)
- [Foundation specification](specs/001-application-foundation/spec.md)

## Spec Kit

Spec Kit 1.1.0 project skills live in `.agents/skills/`. Use the constitution once, then
specification, plan, tasks, implementation, and convergence per feature. The local active feature
is recorded in `.specify/feature.json`. The setup CLI used an isolated environment and is not
installed globally. The next feature is the request-to-asset workflow; specify it before
introducing mutations and state transitions. Small fixes use ordinary development tasks.

Source: https://github.github.com/spec-kit/installation.html
