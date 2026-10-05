# Foundation research

Date: 2026-10-05. Registry and runtime preflight passed; dependency installation follows in T002.

## Angular and runtime

**Decision**: Target Angular framework/CLI 22.2.1; retain existing Node 22.23.2 and npm 10.9.8.
Let the CLI choose TypeScript 6.0.x and RxJS 7.x within supported ranges, then lock dependencies.
Verify compiler-cli peer dependencies before accepting the scaffold.

**Rationale**: Registry metadata and official CLI releases identify a stable v22.2 release. The local
Node version meets the documented `^22.22.3` requirement. No runtime upgrade is needed.

**Alternatives**: Angular prereleases add no required capability; older runtimes are unnecessary
because compatible legacy patterns coexist with modern APIs on one runtime.

Sources: [Angular compatibility](https://angular.dev/reference/versions),
[core registry metadata](https://registry.npmjs.org/@angular/core/latest),
[CLI releases](https://github.com/angular/angular-cli/releases).

## Component and change-detection defaults

**Decision**: Standalone shell, lazy routes, and zoneless bootstrap. Explicitly declare
`standalone: false` in the future NgModule-based Suppliers feature.

**Rationale**: These are current defaults; decorator APIs, NgModules, and RxJS do not by themselves
require Zone.js. Signal Forms are available as stable APIs in v22.

**Alternatives**: An all-NgModule foundation obscures modern coverage; a second runtime adds setup.

Sources: [CLI defaults](https://angular.dev/cli/new),
[zoneless guide](https://angular.dev/guide/zoneless),
[NgModules](https://angular.dev/guide/ngmodules/overview),
[form systems](https://angular.dev/guide/forms/signals/comparison).

## Mock transport

**Decision**: A terminal functional HTTP interceptor serves cancellable synthetic responses from
a seeded in-memory repository. It accepts known `/api/` endpoints only and supports reset/delay/failure.

**Rationale**: Angular supports synthetic HttpResponse results without forwarding to `next`.
This retains feature HttpClient services, preceding interceptors, and response streams with no server.

**Alternatives**: A custom HttpBackend adds DI surface; a service worker or external server adds
setup with no current need. Synthetic requests do not appear in browser Network tools.

Source: [Angular HTTP interceptors](https://angular.dev/guide/http/interceptors).

## Verification

**Decision**: Use Angular CLI-supported Vitest/jsdom unit tests and focused browser checks.

**Rationale**: Current CLI test tooling covers foundational service/form behavior without a custom runner.
Browser automation can be introduced for the later full workflow if needed.

**Alternatives**: Karma is supported but unnecessary; no benchmark or evaluation framework is required.

Source: [Angular testing](https://angular.dev/guide/testing).

## T001 verification

Verified npm registry publication of Angular core/CLI 22.2.1. Core and CLI require Node
`^22.22.3 || ^24.15.0 || >=26.0.0`; local Node 22.23.2 and npm 10.9.8 satisfy the
requirements. Compiler CLI requires TypeScript `>=6.0 <6.1` and compiler exactly 22.2.1.
