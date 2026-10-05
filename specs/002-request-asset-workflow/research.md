# Workflow research

Date: 2026-10-05. Official docs and installed Angular 22.2.1 APIs reviewed by a research agent
as required by the Spec Kit planning skill. No dependencies added or unresolved decisions.

- Decision: typed non-nullable controls, nested delivery FormGroup and homogeneous FormArray.
  Rationale: explicit request contracts and useful repeated-item coverage. Alternative: untyped
  forms obscure contracts. [Typed forms](https://angular.dev/guide/forms/typed-forms).
- Decision: subscribe form.events with takeUntilDestroyed and markForCheck in zoneless views.
  Rationale: programmatic form updates do not schedule rendering themselves.
  [Zoneless](https://angular.dev/guide/zoneless).
- Decision: reusable money CVA with user-change/touched/disabled propagation and intrinsic
  decimal validation; parent/domain own required/min/max rules. Alternative: hiding the entire
  form inside a CVA adds complexity. [CVA](https://angular.dev/api/forms/ControlValueAccessor),
  [Validator](https://angular.dev/api/forms/Validator).
- Decision: linkedSignal preserves only an eligible selected ID within the same identity context;
  signal input/output for action intent and model for an actual two-way filter. Alternative:
  stale object selection leaks outdated status. [linkedSignal](https://angular.dev/guide/signals/linked-signal),
  [inputs](https://angular.dev/guide/signals/inputs), [outputs](https://angular.dev/guide/components/outputs).
- Decision: functional entry guards and CanDeactivate with active-page role reactivity.
  Alternative: entry guards alone do not handle identity changes on an existing route.
  [Route guards](https://angular.dev/guide/routing/route-guards).
- Decision: snapshot command inputs and commit only inside the checked, cancellable timer;
  version conflicts and atomic replacement prevent duplicate/stale transitions. Mutation finalize
  releases saving state when old context completes without a result. Successful commands advance
  context generation to refresh resources. [HTTP lifecycle](https://angular.dev/guide/http/making-requests).
