# Research: Application Completion

Read-only research dispatch follows the plan skill; implementation remains owned by the primary agent.

## Guard contract

Decision: reuse the existing functional unsavedChangesGuard/canLeave contract with busy checked first.
Rationale: WorkflowClient already releases busy before success callbacks; successful save navigation
remains possible, pending saves cannot be discarded, failure retains typed values, context changes cancel.
Alternatives: separate guards or global state would duplicate existing scoped contracts.

## Form validation and focus

Decision: require valid (not merely non-invalid) controls before progression/mutation; preserve form.events
notifications for zoneless Reactive Forms. Use afterNextRender with explicit Injector and scoped viewChild
queries for native fields, the nested money CVA input and the review heading.
Rationale: disabled/pending controls are not valid. DOM controls change between wizard steps.
Alternatives: synchronous query before rendering or setTimeout could target absent/obsolete controls.
References: [Reactive Forms](https://angular.dev/guide/forms/reactive-forms),
[afterNextRender](https://angular.dev/api/core/afterNextRender),
[viewChild](https://angular.dev/api/core/viewChild).

## Routed focus

Decision: NavigationEnd drives focus after rendering, compare final path without query/fragment,
skip initial navigation, preserve a field already focused by the incoming feature, and guard against
superseded callbacks. Focus h1 with tabindex=-1, falling back to main. Keep native skip link.
Rationale: outlet activation precedes stable DOM and misses reused component path parameter changes;
query updates/background HTTP must not steal focus. Suppliers intentionally focuses its initial field.
Alternatives: focus every router event would disrupt filtering, cancellations and existing form behavior.
References: [Angular accessibility](https://angular.dev/best-practices/a11y),
[router lifecycle](https://angular.dev/guide/routing/lifecycle-and-events),
[NavigationEnd](https://angular.dev/api/router/NavigationEnd).

## Final verification

Decision: focused unit regressions plus isolated Chrome checks across all 29 routes and principal stories;
use existing dependencies and pinned setup, app/library builds and formatter. Audit coverage source paths.
Rationale: Angular pattern breadth and connected permissions/cancellation need behavior evidence.
Alternatives: adding a new accessibility or E2E dependency has no requirement for this bounded audit.
This practical audit does not claim certification or exhaustive assistive-technology compatibility.

## Research-agent integration notes

Router review confirms capturing focus at NavigationStart and canceling pending AfterRenderRef on
replacement/canceled/failed/skipped navigation. Preserve newly focused incoming controls; limit
DOM selection to a viewChild route-content container. Existing Suppliers uses ngAfterViewInit to
focus projected fields and must retain it. Return h1/content focus for reused record-ID navigation.
Form review confirms valid rather than invalid gates and explicit control-ID maps for wizard
validation (container/host ng-invalid selectors alone can target unfocusable nodes). Money input's
existing item-cost ID is on its native input; no library API change. Retain loaded asset supplier
choices across transient scenario errors, clear on identity/reset, and provide explicit read retry.
