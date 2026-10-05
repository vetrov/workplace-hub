# Research Decisions

All unknowns resolved against installed Angular 22.2.1 and official Angular guidance; research agents were
read-only. No new packages or runtime changes.

- Decision: Extend the immutable repository and existing terminal mock. Rationale: reuse known actor/version,
  snapshot and generation cancellation boundaries. Alternative: independent mock/backends would fragment reset.
- Decision: Use actual EmployeePicker CVA/NG_VALIDATORS with reactive option-change revalidation. Rationale:
  integrates native keyboard/touch/disabled with existing typed forms. Alternative: plain select adds no missing coverage.
- Decision: Resolver returns an Observable plus catchError/defaultIfEmpty recovery data. Rationale: router unsubscribe
  cancels HTTP and mock obsolete GETs complete EMPTY; a naked firstValueFrom would lose router cancellation.
  Context changes do not rerun resolvers automatically, so a scoped resource owns refresh after navigation.
- Decision: Typed projected column directives with input inference, ngTemplateContextGuard, contentChildren and
  NgTemplateOutlet. Rationale: consumers own cell policy and template types; TemplateRef generic alone is insufficient.
- Decision: @defer on interaction for chart, with all state blocks. Rationale: chart is independently lazy and table
  remains primary accessible output. Alternative: eager chart or new chart package unnecessary.
- Decision: NgComponentOutlet with stable component types and typed input registry plus static hostDirectives.
  Rationale: dynamic widget choices have observable dashboard behavior without runtime component factories.
- Decision: afterNextRender({write}, {injector}) on newly visible focus targets. Rationale: constructor-only hook
  can precede HTTP-rendered controls; event callbacks need an explicit injection context.
- Decision: protect fixed demo identities/managers during transfers and retain historical request team IDs.
  Rationale: actor facts remain coherent and previous approvals retain their routing history.

References: https://angular.dev/guide/components/queries,
https://angular.dev/guide/directives/structural-directives,
https://angular.dev/guide/templates/ng-template,
https://angular.dev/guide/components/programmatic-rendering,
https://angular.dev/guide/directives/directive-composition-api,
https://angular.dev/api/core/afterNextRender,
https://angular.dev/guide/routing/data-resolvers,
https://angular.dev/api/forms/ControlValueAccessor.
