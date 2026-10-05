# Angular coverage matrix

All 31 required entries now have working source and verification. The application preserves the
assigned older/newer Angular profiles in ordinary business features. No evaluation lab or benchmark
is delivered. Milestone 5 will perform the final navigation/accessibility and regression audit.

| ID  | Pattern                                                      | Assigned example                                             | Delivery                      | Status                                                                                                    |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| A01 | Standalone bootstrap and components                          | Shell, Dashboard, Assets                                     | Foundation                    | Implemented                                                                                               |
| A02 | NgModule declarations/exports; `standalone: false`           | Suppliers feature and widgets                                | Angular coverage              | Implemented: lazy Suppliers and exported widgets modules                                                  |
| A03 | Decorator inputs with alias/transform and `ngOnChanges`      | Supplier cards/editors                                       | Angular coverage              | Implemented: required/aliased and boolean-transformed decorator inputs with ngOnChanges                   |
| A04 | Signal inputs, required inputs, transforms                   | Asset cards/detail header                                    | Workflow                      | Implemented: required inputs and boolean transform                                                        |
| A05 | Decorator outputs and EventEmitter                           | Supplier editor actions                                      | Angular coverage              | Implemented: supplier edit/save EventEmitter intents                                                      |
| A06 | `output()` and `model()`                                     | Approval actions and filter controls                         | Workflow                      | Implemented                                                                                               |
| A07 | Typed Reactive Forms, nested FormGroup/FormArray             | Request wizard and repeated line items                       | Workflow                      | Implemented                                                                                               |
| A08 | Actual `@angular/forms/signals` Signal Forms                 | Policy editor with schema validation                         | Angular coverage              | Implemented: real Signal Forms policy model/schema/FormField/submit                                       |
| A09 | Template-driven forms and `ngModel`                          | Preferences                                                  | Foundation                    | Implemented                                                                                               |
| A10 | ControlValueAccessor and validators                          | Request money/employee picker controls                       | Workflow                      | Implemented: money and employee CVAs with validators/touch/disabled/options revalidation                  |
| A11 | Signal Forms custom control integration                      | Policy category picker                                       | Angular coverage              | Implemented: FormValueControl category picker with focus/touch/disabled                                   |
| A12 | RxJS facade, BehaviorSubject, async pipe                     | Supplier directory state                                     | Angular coverage              | Implemented: page-local BehaviorSubject facade and AsyncPipe                                              |
| A13 | signal/computed/linkedSignal                                 | Approval state and selection reconciliation                  | Workflow                      | Implemented                                                                                               |
| A14 | toSignal/toObservable interop                                | Search stream and displayed state                            | Workflow                      | Implemented                                                                                               |
| A15 | HttpClient/RxJS, cancellation, debounced search              | Request list and mutations                                   | Workflow                      | Implemented                                                                                               |
| A16 | httpResource for reads                                       | Asset list/detail queries                                    | Workflow                      | Implemented                                                                                               |
| A17 | Constructor injection                                        | Suppliers services/components                                | Angular coverage              | Implemented: Suppliers client/facades/pages constructor DI                                                |
| A18 | inject(), tokens, scoped providers                           | Shell infrastructure, scenario repository token              | Foundation                    | Implemented                                                                                               |
| A19 | Lazy standalone routes and lazy NgModule                     | Modern features and Suppliers                                | Foundation / Angular coverage | Implemented: lazy standalone routes and lazy Suppliers NgModule                                           |
| A20 | Functional guards/resolvers; CanDeactivate                   | Access and unsaved request protection                        | Foundation / Workflow         | Implemented: functional role guards, report resolver/recovery and dirty/pending CanDeactivate             |
| A21 | Functional and class HTTP interceptors                       | Mock transport; legacy supplier request metadata             | Foundation / Angular coverage | Implemented: root functional mock plus feature class interceptor parent forwarding                        |
| A22 | @ViewChild/@ContentChildren                                  | Supplier editor and composed field                           | Angular coverage              | Implemented: supplier editor ViewChild/ViewChildren and projected ContentChildren focus                   |
| A23 | viewChild()/contentChildren()                                | Asset table and field composition                            | Workflow                      | Implemented: native/custom-control viewChild and composed-table contentChildren queries                   |
| A24 | ng-template/NgTemplateOutlet and content projection          | Reusable field and table cell templates                      | Workflow                      | Implemented: typed report column templates/NgTemplateOutlet and projected actions/footer                  |
| A25 | @if/@for/@switch with track expressions                      | Modern lists and status views                                | Foundation                    | Implemented                                                                                               |
| A26 | Deprecated structural control-flow directives                | Designated Suppliers templates, if present in pinned runtime | Angular coverage              | Implemented: designated Suppliers NgIf/NgFor, available but deprecated in Angular 22                      |
| A27 | @defer with placeholder/loading/error                        | Report result visualization                                  | Enterprise breadth            | Implemented: separately deferred report chart with placeholder/loading/error and keyboard trigger         |
| A28 | Custom attribute/structural directives and pipes             | Permission-aware actions, status display                     | Workflow                      | Implemented: SupplierControl attribute directive, RoleOnly structural directive and DisplayLabel pipe     |
| A29 | Lifecycle hooks, DestroyRef/takeUntilDestroyed, render hooks | Supplier subscriptions and DOM focus handling                | Angular coverage              | Implemented: legacy lifecycle hooks, DestroyRef/takeUntilDestroyed, afterNextRender and afterRenderEffect |
| A30 | OnPush and explicit default change detection example         | Modern components and designated supplier widget             | Angular coverage              | Implemented: explicit OnPush pages and designated Default/Eager card                                      |
| A31 | Dynamic component rendering and host directives              | Dashboard widget registry and shared interaction behavior    | Enterprise breadth            | Implemented: typed Dashboard NgComponentOutlet registry and exposed WidgetSurface host directive inputs   |

The primary application uses zoneless change detection. A Zone.js configuration is optional,
not required for the first foundation slice. Older APIs remain compatible through proper Angular
notifications; their presence does not imply a dependency on Zone.js.

If a deprecated API is unavailable in Angular 22, record the incompatibility and isolate the
historical example in a separate compatible application only through an explicit scope change.
Do not downgrade the main application silently.

## Verified foundation source examples

All paths below exist relative to the repository root. Partial examples do not satisfy the
remaining APIs in a combined matrix entry.

| Coverage                     | Source                                                                                                                                                                                      | Working behavior                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A01, A19 (partial)           | `projects/workplace-hub/src/main.ts`, `projects/workplace-hub/src/app/app.routes.ts`                                                                                                        | Standalone bootstrap and lazy feature routes                                     |
| A04 (partial)                | `projects/ui/src/lib/components/status-badge.ts`                                                                                                                                            | `input.required<string>()` for reusable status display                           |
| A09                          | `projects/workplace-hub/src/app/features/preferences/preferences-page.ts` and `projects/workplace-hub/src/app/features/preferences/preferences-page.html`                                   | FormsModule, NgForm, two-way ngModel, save feedback                              |
| A13 (partial), A14           | `projects/workplace-hub/src/app/core/session/session.ts`, `projects/workplace-hub/src/app/features/requests/request-list.service.ts`                                                        | signal/computed state and toSignal/toObservable interop                          |
| A15 (partial), A29 (partial) | `projects/workplace-hub/src/app/core/list-query.ts`, `projects/workplace-hub/src/app/features/requests/request-list.service.ts`                                                             | Debounced search, scoped query state, switchMap cancellation, takeUntilDestroyed |
| A16 (partial)                | `projects/workplace-hub/src/app/features/assets/asset-list.service.ts`, `projects/workplace-hub/src/app/features/dashboard/dashboard.ts`                                                    | httpResource reads with context guards and reload                                |
| A18, A21 (partial)           | `projects/workplace-hub/src/app/core/mock-http/mock-repository.ts`, `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts`, and `projects/workplace-hub/src/app/app.config.ts` | inject(), repository/context tokens, terminal functional HTTP interceptor        |
| A25 (partial)                | `projects/workplace-hub/src/app/features/requests/requests.html`, `projects/workplace-hub/src/app/features/assets/assets.html`                                                              | @if states and @for rows with stable tracked IDs                                 |

Suppliers, Signal Forms and enterprise examples are documented below. Each original profile is preserved.

## Verified workflow source examples

| Coverage      | Source                                                                                                                                             | Working behavior                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A04, A06      | `projects/workplace-hub/src/app/features/approvals/approval-actions.ts` and `projects/workplace-hub/src/app/features/approvals/approval-filter.ts` | Required request input, boolean-transformed busy input, output decision intent and actual model two-way category filter |
| A07           | `projects/workplace-hub/src/app/features/requests/request-form.ts`, `projects/workplace-hub/src/app/features/requests/request-wizard.ts`           | Typed Reactive Forms, nested delivery FormGroup and repeated item FormArray                                             |
| A10           | `projects/ui/src/lib/components/money-input.ts`                                                                                                    | Implemented: money and employee CVAs with validators/touch/disabled/options revalidation                                |
| A13           | `projects/workplace-hub/src/app/features/approvals/approvals.ts`                                                                                   | linkedSignal keeps eligible selected IDs and reconciles filters/context/decisions                                       |
| A15           | `projects/workplace-hub/src/app/core/workflow-client.ts`, `projects/workplace-hub/src/app/core/mock-http/mock.interceptor.ts`                      | Single-flight HttpClient writes, snapshots, cancellation/finalize and context refresh                                   |
| A16           | `projects/workplace-hub/src/app/core/workflow-read.ts`, `projects/workplace-hub/src/app/features/assets/asset-detail.ts`                           | Resource detail reads and compatible assignment options                                                                 |
| A20 (partial) | `projects/workplace-hub/src/app/core/workflow-guards.ts`                                                                                           | Functional role guards and CanDeactivate with a discard/cancel choice                                                   |
| A24 (partial) | `projects/workplace-hub/src/app/features/requests/request-facts.ts`                                                                                | Content projection lets detail/review pages provide their own actions                                                   |
| A25           | `projects/workplace-hub/src/app/features/requests/request-wizard.html`                                                                             | @switch wizard steps, @if validation/states, tracked @for item rows                                                     |

Zoneless request/inventory forms subscribe to form.events and markForCheck. Policies implement
a separate actual Signal Forms example; Reactive and template-driven examples remain in place.

## Verified Suppliers and purchasing-policy source examples

| Coverage                          | Source                                                                                 | Working behavior                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A02, A19                          | `features/suppliers/suppliers.module.ts`, `supplier-widgets.ts`                        | Lazy NgModule, standalone:false declarations and exported widgets module                                                               |
| A03, A05, A29 (partial), A30      | `features/suppliers/supplier-widgets.ts`, `supplier-editor.ts`                         | Aliased/required/transformed inputs, ngOnChanges, EventEmitter intents, OnPush pages and explicit Default/Eager card                   |
| A12, A17, A21                     | `features/suppliers/supplier-client.ts`, `supplier-facade.ts`                          | Constructor DI, BehaviorSubjects/AsyncPipe/switchMap and class metadata interceptor forwarded to root functional mock                  |
| A22, A24 (partial), A28 (partial) | `features/suppliers/supplier-field.ts`, `supplier-editor.ts`, `supplier-edit-page.ts`  | Projected controls, ContentChildren/ViewChild/ViewChildren and invalid-control/initial focus                                           |
| A08                               | `features/administration/policy-form.ts`, `policy-editor.ts`                           | Actual form/schema/FormField/submit, touched/dirty/reset, field summaries, guarded async saves and unchanged-value retry               |
| A11, A23 (partial)                | `projects/ui/src/lib/components/category-picker.ts`                                    | Generic options, FormValueControl model/value, touch/disabled and viewChild/native focus; loaded and edited selections match the model |
| A26                               | `features/suppliers/supplier-directory.ts`, `supplier-detail.ts`, `supplier-editor.ts` | Working deprecated NgIf/NgFor templates, preserving assigned legacy ownership                                                          |

Feature paths in this table are under `projects/workplace-hub/src/app/` unless fully qualified.
Angular 22 defaults to OnPush. The designated `ChangeDetectionStrategy.Default` value is now a deprecated
alias of Eager; it is intentionally explicit in the legacy card. NgIf/NgFor remain available but deprecated.
The main app stays zoneless; subscriptions/forms use AsyncPipe or explicit markForCheck notifications.
The remaining required APIs are implemented in the enterprise examples below. A separate Zone.js
configuration is optional and is outside the required coverage; the main app remains zoneless.

## Verified enterprise source examples

Feature/core paths below are relative to `projects/workplace-hub/src/app/`; library paths are repository-relative.

| Coverage      | Source                                                                                                                                         | Working behavior                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A10, A23, A29 | `projects/ui/src/lib/components/employee-picker.ts`, `features/teams/team-detail.ts`, `features/reports/report-create.ts`                      | Real CVA/NG_VALIDATORS, programmatic pristine/reset, native focus/touch/disabled, retained/unavailable selections, option revalidation and render hooks   |
| A20           | `features/reports/report-resolver.ts`, `reports.routes.ts`, `report-detail.ts`, `core/mock-http/context.ts`                                    | Cancelable ResolveFn Observable, typed failure/EMPTY recovery, input-bound route reuse and immediate context clearing; singleton context stream           |
| A23, A24      | `projects/ui/src/lib/components/composed-table.ts`, `features/reports/report-detail.ts`                                                        | Typed generic column input/context guard, contentChildren, NgTemplateOutlet cell contexts and projected footer; dynamic column changes verified           |
| A27           | `features/reports/report-detail.ts`, `report-chart.ts`                                                                                         | Chart imported only inside @defer; production verification proves own chunk absent before interaction and working placeholder/loading/error/reload states |
| A28           | `core/role-only.ts`, `projects/ui/src/lib/components/display-label.ts`, `features/assets/asset-detail.html`, `features/reports/report-list.ts` | Signal-aware structural role action visibility plus generic pure label pipe; domain permissions remain authoritative                                      |
| A29           | `core/reactive-editor.ts`, `features/assets/asset-editor.ts`, `features/administration/organization-editor.ts`                                 | Scoped form notifications/unsubscription, snapshot/reset/dirty behavior and render-timed invalid-control focus                                            |
| A31           | `features/dashboard/dashboard.ts`, `dashboard-widgets.ts`, `projects/ui/src/lib/components/widget-surface.ts`                                  | Actual component-type switching and input forwarding, reusable host region/focus behavior and exposed host-input labels                                   |

Focused tests include real forms/controls, typed projection updates, resolver cancellation/recovery/reuse,
dynamic widget types/host labels and structural role changes. Chrome verifies keyboard interaction,
permissions/context cancellation, failure retry, all enterprise routes at 390px and production defer states.
