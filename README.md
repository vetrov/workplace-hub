# Workplace Hub

Browser-only Angular enterprise application with intentionally varied Angular patterns.
The business domain is equipment requests, approvals, suppliers, and asset management.

## Current implementation

Milestones 0–3 are implemented and verified. Eighteen business screens cover Dashboard;
request list/create/edit/details; approval queue/review; asset list/create/details/assignment;
Suppliers directory/create/details/edit; purchasing policy list/editor; and Preferences.
Employees create typed Reactive Forms requests, managers review them, and administrators fulfill
approved requests, maintain supplier contacts and configure future submission limits.

Suppliers is a lazy NgModule with decorator component APIs, constructor injection, lifecycle/query
examples, RxJS/BehaviorSubject state and a feature-local class HTTP interceptor forwarding to the root
functional mock. Purchasing policies use actual Angular Signal Forms, schema validation, FormField/submit
and a reusable FormValueControl category picker. Preferences remain template-driven.
Supplier changes update inventory options and labels; policy limits apply to future submissions,
while drafts and previous decisions retain their existing behavior.

The shell supports demo identities, normal/empty/delayed/error responses and deterministic reset.
Lists use query URLs, and editors protect unsaved changes and cancel pending writes on context changes.
People/Teams, Reports, asset editing and remaining administration pages are next. Query/template/directive,
deferred/dynamic-rendering and resolver examples still have explicitly planned coverage entries.
See the [coverage matrix](docs/angular-coverage.md) for actual source locations and remaining patterns.
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

The unit suite has 90 focused checks across 18 files. Production output is `dist/workplace-hub/browser`;
static hosting must provide SPA history fallback. Domain and UI builds output to `dist/domain`
and `dist/ui`. See [the validation guide](specs/001-application-foundation/quickstart.md)
and [foundation results](specs/001-application-foundation/tasks.md). The new workflow has its own
[validation guide](specs/002-request-asset-workflow/quickstart.md) and
[recorded results](specs/002-request-asset-workflow/tasks.md). Suppliers and policies have their own
[validation guide](specs/003-angular-pattern-coverage/quickstart.md) and
[recorded results](specs/003-angular-pattern-coverage/tasks.md).

## Formatting

Use `npm run format` to format the repository and `npm run format:check` to verify it.
The pinned Prettier version uses its [standard style](https://prettier.io/docs/options)
with four spaces, an 80-column target, single quotes and one HTML attribute per line.
Angular templates use whitespace-insensitive layout to keep opening and closing tags readable.
`.editorconfig` uses the same indentation. Generated output, dependencies and the npm lockfile
are excluded by `.prettierignore`; unsupported file types are skipped.

Keep blank lines after import groups, between declarations and between class methods.
Separate longer field initializers from adjacent fields. Prettier preserves these logical
separators; it does not insert them automatically.

## Explore the demo

| Identity                     | Scope                             | Seeded request / asset totals |
| ---------------------------- | --------------------------------- | ----------------------------- |
| Alex Garcia · Employee       | Own requests and assigned assets  | 3 / 6                         |
| Alex Chen · Manager          | Team requests and assigned assets | 22 / 44                       |
| Taylor Patel · Administrator | All records                       | 250 / 2,000                   |

The related seed also contains 80 people, 12 teams, and 40 suppliers. The terminal functional
HTTP interceptor returns synthetic responses inside the app; no separate backend runs and these
requests do not appear as real browser network traffic. Demo permissions simulate application
behavior. Identity and display choices persist when localStorage is available; business data is
in memory and recreated on reload. Reset restores seeds, normal responses, and the active list's
query defaults while preserving identity and display choices. Retry restores normal responses.

New/edit requests accept equipment/software categories, valid
delivery and 1–10 cost items. One compatible available asset fulfills a demo request; estimated
items describe budget rather than multiple inventory allocations. Valid drafts meet the same
field constraints as submissions. Rejected requests remain readable, with resubmission planned.
Record versions prevent stale writes; reset/identity changes cancel pending commands.
Supplier contacts are administrator-only; authorized inventory pages read ID/name options without contacts.
New suppliers use stable IDs and case-insensitive unique names. Three category policies start at €50,000;
enabled policies reject over-limit future submissions, combining same-category limits by minimum.
Reset restores original suppliers and policies along with requests and inventory.

## Structure and planning

- `projects/workplace-hub`: standalone shell, lazy feature pages, and local infrastructure.
- `projects/domain`: shared contracts, visibility, query normalization and workflow validation/permissions.
- `projects/ui`: status badge, money value accessor and shared styles, without business policy.
- [Project constitution](.specify/memory/constitution.md)
- [Product overview](docs/product-overview.md)
- [Implementation roadmap](docs/implementation-roadmap.md)
- [Route map](docs/route-map.md)
- [Architecture decision](docs/architecture/0001-app-architecture.md)
- [Foundation specification](specs/001-application-foundation/spec.md)
- [Workflow specification](specs/002-request-asset-workflow/spec.md)

## Spec Kit

Spec Kit 1.1.0 project skills live in `.agents/skills/`. Use the constitution once, then
specification, plan, tasks, implementation, and convergence per feature. The local active feature
is recorded in `.specify/feature.json`. The setup CLI used an isolated environment and is not
installed globally. Suppliers and actual Signal Forms policies are delivered. The next feature is enterprise breadth:
People/Teams, Reports, asset editing and remaining administration, followed by the completion audit.
Small fixes use ordinary development tasks.

Source: https://github.github.com/spec-kit/installation.html
