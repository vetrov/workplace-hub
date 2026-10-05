# Implementation Plan: Suppliers and Purchasing Policies

**Branch**: `main` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

## Summary

Implement four Suppliers routes as a lazy NgModule with decorator widgets, constructor injection,
RxJS facade and an actual DI class interceptor. Add two standalone purchasing-policy routes with
Angular Signal Forms and a signal-compatible category control. Preserve older/newer pattern ownership.

## Technical Context

Angular 22.2.1; TypeScript 6.0.3; RxJS 7.8.2; Node 22.23.2/npm 10.9.8. No new dependencies.
Browser-only zoneless SPA; strict templates/types; deterministic in-memory mock HTTP repository.
Vitest/jsdom, production/library builds, isolated Chrome keyboard/workflow/mobile checks.
Forty seeded suppliers and three policies; directory pages capped at 25 rows; six additional routes.

## Constitution Check

Pre- and post-design checks pass. Intentional diversity is preserved: Suppliers use NgModule,
standalone:false components, decorator inputs/outputs, lifecycle/query APIs and RxJS state.
Policies use actual @angular/forms/signals form/schema/FormField/submit APIs rather than wrapping
Reactive Forms in signals. Shared UI contains only form presentation/control behavior; domain
contains validation and purchasing-limit rules. Existing command actor/version/cancellation checks
remain in the root mock. No SSR, external services, evaluation work or runtime downgrade.

## Project Structure

- projects/domain/src/lib/models/administration.ts and policies/administration.ts: contracts/validators/limit rules.
- projects/workplace-hub/src/app/core/mock-http/administration-repository.ts: immutable suppliers/policies and versions.
- core/mock-http/mock.interceptor.ts: extend the existing terminal dispatcher, preserving scenario cancellation.
- features/suppliers/: NgModule, page-local BehaviorSubject facade, lazy HTTP providers, metadata interceptor,
  directory/details and editor; widgets module declares/exports decorator card and composed fields.
- projects/ui/src/lib/components/category-picker.ts: FormValueControl with model/value, disabled/touch, viewChild/focus.
- features/administration/: policy list and editor with real Signal Forms and schema validation.
- core/workflow-read.ts: reusable scoped collection reads for dynamic supplier options/names.
- app.routes.ts, shell and inventory pages: navigation and coherent cross-feature relationships.
- specs/003-angular-pattern-coverage/: feature artifacts and recorded evidence.

## Delivery Design

Extend WorkflowRepository through AdministrationRepository; MockRepository inherits it. Reset enriches the
existing suppliers with immutable contact/version data and restores three immutable policies. Validated supplier
writes use case-insensitive unique names and optimistic versions. Policy writes use optimistic versions; future
submitted requests validate applicable enabled category limits before committing. Do not reinterpret prior approvals.

Supplier feature HttpClient uses withInterceptorsFromDi and withRequestsMadeViaParent. The class interceptor
adds feature metadata and forwards to the root terminal mock; no real network or duplicate mock providers.
Page-local facade owns BehaviorSubjects and combines context, route/query and reload streams using switchMap.
Context changes cancel old reads/writes, clear data synchronously in views, and end page subscriptions on destroy.
AsyncPipe and explicit markForCheck keep designated Default/Eager widgets and form subscriptions zoneless.
NgIf/NgFor and ChangeDetectionStrategy.Default still exist in 22.2.1 but are deprecated; isolate and document them.

Directory supports name/email search, stable 25-row pages and query URLs. Details link authorized inventory.
Editor uses typed Reactive Forms inside the legacy feature, aliased/boolean-transformed decorator inputs,
EventEmitter intents, ngOnChanges record loading, ViewChild child access and ContentChildren projected fields
for focus of invalid controls. Fields/controls contain no business permissions. Navigation checks dirty/busy.

Policy editor uses form(model,schema), FormField, required/minLength/maxLength/validate/disabled and submit
with ignoreValidators:none. CategoryPicker implements FormValueControl<string>. submit marks fields touched;
focus errorSummary's first bound control. Keep persisted snapshot/version separate from the editing model.
Use cancelable HTTP completion promises and release submitting state in finally. Validate category/decimal
cost in both schema and domain. Failed saves keep inputs; identity/reset clears them and reloads authorized reads.
Guard submitting/busy as well as dirty because disabled fields do not aggregate dirty state.

## Implementation Strategy

Complete shared contracts/transport first, deliver the supplier directory/details, then contact editing,
then Signal Forms policies. Each completed task is formatted, verified appropriately and committed locally.
Finish cross-feature inventory options/names, all principal flows and a coverage/documentation audit.
No unresolved technical clarifications or constitution deviations remain.
