# Angular coverage matrix

Every entry is planned. Update status and add actual source locations after implementation.
Patterns live in business features; there is no evaluation lab or benchmark deliverable.

| ID | Pattern | Assigned example | Delivery | Status |
| --- | --- | --- | --- | --- |
| A01 | Standalone bootstrap and components | Shell, Dashboard, Assets | Foundation | Planned |
| A02 | NgModule declarations/exports; `standalone: false` | Suppliers feature and widgets | Angular coverage | Planned |
| A03 | Decorator inputs with alias/transform and `ngOnChanges` | Supplier cards/editors | Angular coverage | Planned |
| A04 | Signal inputs, required inputs, transforms | Asset cards/detail header | Workflow | Planned |
| A05 | Decorator outputs and EventEmitter | Supplier editor actions | Angular coverage | Planned |
| A06 | `output()` and `model()` | Approval actions and filter controls | Workflow | Planned |
| A07 | Typed Reactive Forms, nested FormGroup/FormArray | Request wizard and repeated line items | Workflow | Planned |
| A08 | Actual `@angular/forms/signals` Signal Forms | Policy editor with schema validation | Angular coverage | Planned |
| A09 | Template-driven forms and `ngModel` | Preferences | Foundation | Planned |
| A10 | ControlValueAccessor and validators | Request money/employee picker controls | Workflow | Planned |
| A11 | Signal Forms custom control integration | Policy category picker | Angular coverage | Planned |
| A12 | RxJS facade, BehaviorSubject, async pipe | Supplier directory state | Angular coverage | Planned |
| A13 | signal/computed/linkedSignal | Approval state and selection reconciliation | Workflow | Planned |
| A14 | toSignal/toObservable interop | Search stream and displayed state | Workflow | Planned |
| A15 | HttpClient/RxJS, cancellation, debounced search | Request list and mutations | Workflow | Planned |
| A16 | httpResource for reads | Asset list/detail queries | Workflow | Planned |
| A17 | Constructor injection | Suppliers services/components | Angular coverage | Planned |
| A18 | inject(), tokens, scoped providers | Shell infrastructure, scenario repository token | Foundation | Planned |
| A19 | Lazy standalone routes and lazy NgModule | Modern features and Suppliers | Foundation / Angular coverage | Planned |
| A20 | Functional guards/resolvers; CanDeactivate | Access and unsaved request protection | Foundation / Workflow | Planned |
| A21 | Functional and class HTTP interceptors | Mock transport; legacy supplier request metadata | Foundation / Angular coverage | Planned |
| A22 | @ViewChild/@ContentChildren | Supplier editor and composed field | Angular coverage | Planned |
| A23 | viewChild()/contentChildren() | Asset table and field composition | Workflow | Planned |
| A24 | ng-template/NgTemplateOutlet and content projection | Reusable field and table cell templates | Workflow | Planned |
| A25 | @if/@for/@switch with track expressions | Modern lists and status views | Foundation | Planned |
| A26 | Deprecated structural control-flow directives | Designated Suppliers templates, if present in pinned runtime | Angular coverage | Planned, compatibility check |
| A27 | @defer with placeholder/loading/error | Report result visualization | Enterprise breadth | Planned |
| A28 | Custom attribute/structural directives and pipes | Permission-aware actions, status display | Workflow | Planned |
| A29 | Lifecycle hooks, DestroyRef/takeUntilDestroyed, render hooks | Supplier subscriptions and DOM focus handling | Angular coverage | Planned |
| A30 | OnPush and explicit default change detection example | Modern components and designated supplier widget | Angular coverage | Planned |
| A31 | Dynamic component rendering and host directives | Dashboard widget registry and shared interaction behavior | Enterprise breadth | Planned |

The primary application uses zoneless change detection. A Zone.js configuration is optional,
not required for the first foundation slice. Older APIs remain compatible through proper Angular
notifications; their presence does not imply a dependency on Zone.js.

If a deprecated API is unavailable in Angular 22, record the incompatibility and isolate the
historical example in a separate compatible application only through an explicit scope change.
Do not downgrade the main application silently.
