# Implementation Plan: Application Completion

**Branch**: main | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

## Summary

Finish roadmap milestone 5: consistent request/new-asset guards, render-safe keyboard focus,
all-route accessibility/navigation audit, final regressions and accurate completion documentation.

## Technical Context

Pinned Angular 22.2.1, TypeScript 6.0.3, RxJS 7.8.2, Vitest 5.0.3/jsdom 30.1.2;
Node 22.23.2/npm 10.9.8. Browser-only zoneless SPA, existing domain/ui libraries and local
immutable mock HTTP. No dependencies or business entities added. Keep initial bundle under
existing 500kB warning budget. Scope is all 29 screens/31 patterns with bounded source changes.

## Constitution Check

Pre-design and post-design gates pass for all five principles. Preserve Suppliers NgModule,
decorators, deprecated control flow and explicit Default/Eager; preserve actual Signal Forms,
template-driven preferences, typed Reactive Forms, all modern/deferred/dynamic examples.
Domain/transport rules unchanged; lazy feature boundaries, deterministic reset/roles and no SSR
remain. Verify behavior and document only completed work. No complexity exceptions.

## Project Structure and Decisions

- app.routes.ts: add existing unsavedChangesGuard to assets/new.
- features/requests/request-wizard.ts/.html: pending guard, require valid controls, render-timed
  first-invalid/next-step/back-step focus using explicit control-ID maps scoped to a viewChild form and focusable review heading.
- features/assets/asset-create.ts: dirty/pending canLeave, valid-form save gate and invalid-field focus and scoped loaded supplier-options recovery;
  import shared validation directly from core rather than another feature.
- shell/shell/shell.ts/.html: NavigationEnd subscription with takeUntilDestroyed, compare path only, cancel pending AfterRenderRef on navigation changes,
  afterNextRender with explicit Injector, focus current h1 (routed-content fallback) after successful page changes.
  Skip initial navigation/query/fragment-only changes and preserve editor-assigned input focus.
  Remove the obsolete planned-link loop/empty field now all sections exist.
- Focus callbacks use current view queries, ignore destroyed scope or superseded route/step, and
  do not run on background data refresh. Do not introduce another router or global scroll behavior.
- Focused component/router tests verify pristine/dirty/pending/failure/cancellation and focus;
  isolated Chrome checks real keyboard behavior and post-save navigation.
- docs/verification.md records practical audited scenarios and limitations. Update README, AGENTS,
  roadmap, route map, product overview, architecture and coverage matrix only after final evidence.

## Verification and Delivery

T001 design; T002 repair/test editor safeguards; T003 navigation/wizard focus; T004 final route,
keyboard/state/workflow regression and setup/coverage audit; T005 completion docs and convergence.
Commit each completed step locally on main. Production app and both libraries, full tests and format
check are final gates. Browser checks use isolated local Chrome contexts; business mutations stay
inside SPA navigation since reload restores seeds. No external business calls, publishing or deployment.

## Complexity Tracking

No constitution violations or added dependencies. Read-only research agents verify pinned router,
render-hook and forms behavior; findings are recorded in research.md.
