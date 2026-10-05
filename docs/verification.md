# Application verification

Completed 2026-10-06. All roadmap milestones 0–5 and five feature task lists are complete.
The repository contains 29 planned business screens and 31 required Angular pattern entries.
Each implementation step is a local Git commit; no push, PR, deployment or evaluation work.

## Reproducible setup and automated checks

Node 22.23.2 / npm 10.9.8; Angular 22.2.1, TypeScript 6.0.3, RxJS 7.8.2.
A separate clean source copy installed the committed lockfile with npm ci (cached/offline) and
passed the same commands as the working repository. No dependencies were added during completion.

```sh
cd ~/repos/workplace-hub
npm ci
npm test -- --watch=false
npm run build
npm run build:libs
npm run format:check
npm start
```

| Check                          | Result                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Unit/component/domain suite    | 143 tests across 33 files pass                                                   |
| Production application         | Pass; initial 403.82 kB raw / 113.61 kB estimated transfer, below 500 kB warning |
| Domain and UI library builds   | Both pass                                                                        |
| Prettier four-space formatting | Pass                                                                             |
| Lockfile/runtime configuration | Exact manifest/lockfile versions match; clean setup verified                     |
| Required Angular source matrix | All 31 implemented entries audited; referenced source files exist                |
| Client-side application        | Browser entry only; no SSR/server/prerender build configuration                  |

Tests cover policies, versions, immutable relationships, form validation/CVAs/Signal Forms,
query state, cancellation/reset, actual editors, resolver recovery/reuse, typed template composition,
role directives, dynamic widget types and host behavior. Completion adds real navigation/focus,
failed retry, single-flight and pending/dirty guard regressions.

## Isolated Chrome verification

Checks ran in isolated browser contexts against local development and production static previews.
Production preview uses SPA history fallback to serve client files. It is not an application server.
No uncaught application errors or external business requests occurred in passing checks.

| Area                    | Verified behavior                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All 29 business routes  | Authorized direct entry/reload at 1440px and 390px; title, one h1/main, labeled visible controls, unique IDs, no document overflow or normal-state alerts         |
| Helper routes           | Access-denied and not-found recovery, page focus and return links                                                                                                 |
| Keyboard focus          | Native skip link, successful page changes, query-control retention, record-ID reuse, denied navigation, preserved Suppliers initial/edit field focus              |
| Requests                | Details/items/review/back focus; invalid native money focus; nested forms, draft/edit/submit, validation and failure retention                                    |
| Requests/asset creation | Pristine leaving, dirty cancel/discard, pending navigation blocked without dialog, unchanged-input retry and successful detail navigation                         |
| Pagination              | Requests/Assets/People/Suppliers keep focused controls through query loading; guarded aria-disabled actions; normalized last-page navigation                      |
| Principal workflow      | Employee draft/edit/submit → manager approval/rejection → administrator inventory creation/atomic assignment → employee linked history                            |
| Suppliers               | Contact validation/focus, create/edit, inventory option/name propagation, failed unchanged-value retry, dirty/pending/reset/identity behavior                     |
| Signal Forms policies   | Schema/touched/dirty/errors, native custom picker selection/keyboard, unchanged-value retry, versions and limit enforcement on later submissions                  |
| People and Teams        | Search/paging/profile scope, protected/versioned transfer, changed memberships/current inventory visibility, retained failed transfer draft/options               |
| Asset maintenance       | Metadata/history, maintenance exclusion from assignment, restore availability, protected assigned allocation/type, dirty guard/retry/reset/identity               |
| Reports                 | Owner/team scope, saved dataset/status/person filters, resolver failed/EMPTY/context recovery, full scoped CSV and 100-row rendering cap                          |
| Deferred/dynamic views  | Separate chart chunk absent before keyboard interaction; placeholder/loading/chunk-failure/reload recovery; table remains usable; actual widget types/host labels |
| Organization            | Name/default dataset effects, category pause→rejected submission/allowed draft→enable/resubmit, manager creation/export capability effects                        |
| Demo response states    | Applicable loading/empty/error/retry/missing/permission states across foundation, workflow, Suppliers/policies and all 11 enterprise routes                       |
| Cancellation and reset  | Delayed writes canceled by identity/reset; obsolete records/drafts hidden, original deterministic seed restored                                                   |
| Preferences             | Dark/compact persistence, reset preservation, visible keyboard focus, blocked-localStorage fallback; representative production routes at 390px dark/compact       |

The final audit repaired two missing editor guards, supplier choice recovery during creation failure,
page/wizard invalid-field focus, and pagination controls removed during loading. Changes preserve
intentional older/newer APIs and scoped data boundaries.

## Repeat the business scenarios

Use the feature [foundation](../specs/001-application-foundation/quickstart.md),
[workflow](../specs/002-request-asset-workflow/quickstart.md),
[Suppliers/policies](../specs/003-angular-pattern-coverage/quickstart.md),
[enterprise](../specs/004-enterprise-breadth/quickstart.md) and
[completion](../specs/005-application-completion/quickstart.md) validation guides.
Use [route map](route-map.md) for all screen URLs and [coverage](angular-coverage.md) for source owners.

Business changes are in memory: use SPA links for connected stories; reload restores seeds.
Identity and display choices persist separately when browser storage is available. The audit is a
practical keyboard/layout/label review; it does not claim exhaustive assistive-technology certification.
Browser automation used workspace-local Playwright with Chrome; it adds no project dependency.
