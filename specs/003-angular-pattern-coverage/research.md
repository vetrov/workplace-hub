# Research: Angular 22 pattern coverage

## Legacy profile

Decision: Use a lazy SuppliersModule and an exported SupplierWidgetsModule, explicit standalone:false
components, constructor DI, Input/Output decorators, lifecycle/query APIs, AsyncPipe and page-scoped
BehaviorSubject state. NgIf/NgFor remain available in installed 22.2.1, deprecated since v20. Default
change detection is the deprecated Eager alias; explicitly designate a Default card and OnPush pages.
Rationale: Working older APIs remain visible in business features without runtime downgrade or Zone.js.
Alternative: Converting Suppliers to standalone/signals would remove the assigned historical examples.

Decision: provideHttpClient(withInterceptorsFromDi(),withRequestsMadeViaParent()) in SuppliersModule,
with feature-local HTTP_INTERCEPTORS and a feature-local constructor-injected client.
Rationale: The feature class interceptor executes and then forwards to the existing root terminal mock.
Alternative: Root-provided client bypasses the feature interceptor; repeating the mock risks duplicate transport.
Sources: https://angular.dev/api/common/http/withRequestsMadeViaParent,
https://angular.dev/guide/zoneless, https://angular.dev/api/core/ChangeDetectionStrategy.

## Signal Forms profile

Decision: Use installed @angular/forms/signals form/schema, FormField/[formField], submit and
FormValueControl<string>; no signal wrapper around Reactive Forms. Source declarations and a strict
TypeScript probe verified the APIs. submit(...,{ignoreValidators:'none',action}) marks controls touched;
reset(savedValue) clears dirty/touched. A custom picker uses model/value, input disabled, output touch and focus.
Rationale: Demonstrates the actual form system alongside Reactive and template-driven examples.
Alternative: Earlier Field/[field] documentation snippets do not match the pinned package.

Dirty state is sticky for UI edits; loading model.set does not mark dirty. Disabled fields skip validation
and dirty aggregation, so navigation also checks submitting/busy. Catch expected save failures inside
the submit action; return validation errors rather than DTOs. Root save errors clear when model values change.
Sources: https://angular.dev/guide/forms/signals/custom-controls,
https://angular.dev/guide/forms/signals/form-submission,
https://angular.dev/guide/forms/signals/field-state-management.

## Business integration

Decision: Suppliers/policies extend the root immutable workflow store and terminal dispatcher.
Policy limits affect only future submissions; inventory reads current supplier options and names.
Rationale: New sections expose real behavior and relationships without replacing existing workflows.
Alternative: Local component-only saves would not survive navigation or affect purchasing behavior.
All changes remain in memory, deterministic and resettable. No new dependencies are needed.
