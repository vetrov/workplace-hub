# Angular coverage matrix

Foundation and workflow examples below are implemented and verified. The matrix distinguishes complete
entries from partial examples; later business features and APIs remain planned. Patterns live
in business features; there is no evaluation lab or benchmark deliverable.

| ID | Pattern | Assigned example | Delivery | Status |
| --- | --- | --- | --- | --- |
| A01 | Standalone bootstrap and components | Shell, Dashboard, Assets | Foundation | Implemented |
| A02 | NgModule declarations/exports; `standalone: false` | Suppliers feature and widgets | Angular coverage | Planned |
| A03 | Decorator inputs with alias/transform and `ngOnChanges` | Supplier cards/editors | Angular coverage | Planned |
| A04 | Signal inputs, required inputs, transforms | Asset cards/detail header | Workflow | Implemented: required inputs and boolean transform |
| A05 | Decorator outputs and EventEmitter | Supplier editor actions | Angular coverage | Planned |
| A06 | `output()` and `model()` | Approval actions and filter controls | Workflow | Implemented |
| A07 | Typed Reactive Forms, nested FormGroup/FormArray | Request wizard and repeated line items | Workflow | Implemented |
| A08 | Actual `@angular/forms/signals` Signal Forms | Policy editor with schema validation | Angular coverage | Planned |
| A09 | Template-driven forms and `ngModel` | Preferences | Foundation | Implemented |
| A10 | ControlValueAccessor and validators | Request money/employee picker controls | Workflow | Implemented: money CVA/validators; employee picker planned |
| A11 | Signal Forms custom control integration | Policy category picker | Angular coverage | Planned |
| A12 | RxJS facade, BehaviorSubject, async pipe | Supplier directory state | Angular coverage | Planned |
| A13 | signal/computed/linkedSignal | Approval state and selection reconciliation | Workflow | Implemented |
| A14 | toSignal/toObservable interop | Search stream and displayed state | Workflow | Implemented |
| A15 | HttpClient/RxJS, cancellation, debounced search | Request list and mutations | Workflow | Implemented |
| A16 | httpResource for reads | Asset list/detail queries | Workflow | Implemented |
| A17 | Constructor injection | Suppliers services/components | Angular coverage | Planned |
| A18 | inject(), tokens, scoped providers | Shell infrastructure, scenario repository token | Foundation | Implemented |
| A19 | Lazy standalone routes and lazy NgModule | Modern features and Suppliers | Foundation / Angular coverage | Partial: lazy standalone; NgModule planned |
| A20 | Functional guards/resolvers; CanDeactivate | Access and unsaved request protection | Foundation / Workflow | Partial: entry/unsaved guards; resolvers planned |
| A21 | Functional and class HTTP interceptors | Mock transport; legacy supplier request metadata | Foundation / Angular coverage | Partial: functional mock; class interceptor planned |
| A22 | @ViewChild/@ContentChildren | Supplier editor and composed field | Angular coverage | Planned |
| A23 | viewChild()/contentChildren() | Asset table and field composition | Workflow | Planned |
| A24 | ng-template/NgTemplateOutlet and content projection | Reusable field and table cell templates | Workflow | Partial: content projection; template outlets planned |
| A25 | @if/@for/@switch with track expressions | Modern lists and status views | Foundation | Implemented |
| A26 | Deprecated structural control-flow directives | Designated Suppliers templates, if present in pinned runtime | Angular coverage | Planned, compatibility check |
| A27 | @defer with placeholder/loading/error | Report result visualization | Enterprise breadth | Planned |
| A28 | Custom attribute/structural directives and pipes | Permission-aware actions, status display | Workflow | Planned |
| A29 | Lifecycle hooks, DestroyRef/takeUntilDestroyed, render hooks | Supplier subscriptions and DOM focus handling | Angular coverage | Partial: takeUntilDestroyed; other hooks planned |
| A30 | OnPush and explicit default change detection example | Modern components and designated supplier widget | Angular coverage | Planned |
| A31 | Dynamic component rendering and host directives | Dashboard widget registry and shared interaction behavior | Enterprise breadth | Planned |

The primary application uses zoneless change detection. A Zone.js configuration is optional,
not required for the first foundation slice. Older APIs remain compatible through proper Angular
notifications; their presence does not imply a dependency on Zone.js.

If a deprecated API is unavailable in Angular 22, record the incompatibility and isolate the
historical example in a separate compatible application only through an explicit scope change.
Do not downgrade the main application silently.

## Verified foundation source examples

All paths below exist relative to the repository root. Partial examples do not satisfy the
remaining APIs in a combined matrix entry.

| Coverage | Source | Working behavior |
| --- | --- | --- |
| A01, A19 (partial) | `projects/workplace-hub/src/main.ts`, `projects/workplace-hub/src/app/app.routes.ts` | Standalone bootstrap and lazy feature routes |
| A04 (partial) | `projects/ui/src/lib/components/status-badge.ts` | `input.required<string>()` for reusable status display |
| A09 | `projects/workplace-hub/src/app/features/preferences/preferences-page.ts` and `projects/workplace-hub/src/app/features/preferences/preferences-page.html` | FormsModule, NgForm, two-way ngModel, save feedback |
| A13 (partial), A14 | `projects/workplace-hub/src/app/core/session/session.ts`, `projects/workplace-hub/src/app/features/requests/request-list.service.ts` | signal/computed state and toSignal/toObservable interop |
| A15 (partial), A29 (partial) | `projects/workplace-hub/src/app/core/list-query.ts`, `projects/workplace-hub/src/app/features/requests/request-list.service.ts` | Debounced search, scoped query state, switchMap cancellation, takeUntilDestroyed |
| A16 (partial) | `projects/workplace-hub/src/app/features/assets/asset-list.service.ts`, `projects/workplace-hub/src/app/features/dashboard/dashboard.ts` | httpResource reads with context guards and reload |
| A18, A21 (partial) | `projects/workplace-hub/src/app/core/mock-http/mock-repository.ts`, `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts`, and `projects/workplace-hub/src/app/app.config.ts` | inject(), repository/context tokens, terminal functional HTTP interceptor |
| A25 (partial) | `projects/workplace-hub/src/app/features/requests/requests.html`, `projects/workplace-hub/src/app/features/assets/assets.html` | @if states and @for rows with stable tracked IDs |

Signal Forms, decorator inputs/outputs, NgModules and the other planned APIs have no completed
example yet. No legacy profile has been silently modernized.

## Verified workflow source examples

| Coverage | Source | Working behavior |
| --- | --- | --- |
| A04, A06 | `projects/workplace-hub/src/app/features/approvals/approval-actions.ts` and `projects/workplace-hub/src/app/features/approvals/approval-filter.ts` | Required request input, boolean-transformed busy input, output decision intent and actual model two-way category filter |
| A07 | `projects/workplace-hub/src/app/features/requests/request-form.ts`, `projects/workplace-hub/src/app/features/requests/request-wizard.ts` | Typed Reactive Forms, nested delivery FormGroup and repeated item FormArray |
| A10 | `projects/ui/src/lib/components/money-input.ts` | ControlValueAccessor plus intrinsic NG_VALIDATORS; parent/domain own business constraints |
| A13 | `projects/workplace-hub/src/app/features/approvals/approvals.ts` | linkedSignal keeps eligible selected IDs and reconciles filters/context/decisions |
| A15 | `projects/workplace-hub/src/app/core/workflow-client.ts`, `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts` | Single-flight HttpClient writes, snapshots, cancellation/finalize and context refresh |
| A16 | `projects/workplace-hub/src/app/core/workflow-read.ts`, `projects/workplace-hub/src/app/features/assets/asset-detail.ts` | Resource detail reads and compatible assignment options |
| A20 (partial) | `projects/workplace-hub/src/app/core/workflow-guards.ts` | Functional role guards and CanDeactivate with a discard/cancel choice |
| A24 (partial) | `projects/workplace-hub/src/app/features/requests/request-facts.ts` | Content projection lets detail/review pages provide their own actions |
| A25 | `projects/workplace-hub/src/app/features/requests/request-wizard.html` | @switch wizard steps, @if validation/states, tracked @for item rows |

Zoneless request/inventory forms subscribe to form.events and markForCheck; Signal Forms have
not been substituted with signals wrapped around Reactive Forms. They remain a separate later example.
