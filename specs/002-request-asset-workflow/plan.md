# Implementation Plan: Request-to-Asset Workflow

**Branch**: `main` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing Angular SPA with request wizard/details, manager approval queue/review,
asset creation/details/assignment and linked history. Preserve read infrastructure and older-pattern
feature ownership. Use no new dependencies.

## Technical Context

TypeScript 6.0.3; Angular 22.2.1; RxJS 7.8.2; Node 22.23.2/npm 10.9.8. Browser-only/zoneless.
In-memory repository; existing localStorage identity/display persistence. Vitest/jsdom and focused
isolated Chrome checks. Bounded list rendering; eight additional business routes (12 of 29 total).
No SSR, production services, evaluation work, or persistent business database.

## Constitution Check

Pre- and post-design checks pass. Requests use typed Reactive Forms and a reusable money
ControlValueAccessor; Approvals use signal inputs/outputs/model and linkedSignal; Assets use
httpResource reads. Shared policies and commands live in domain; UI controls have no business
permissions. Writes are authorized/validated in the mock repository and committed only after
current context checks. Reset restores enriched seed state. Focused tests cover meaningful
validation, state transitions, atomicity, conflicts and cancellation. Other assigned APIs remain planned.

## Project Structure

`projects/domain/src/lib/models/workflow.ts` and `policies/workflow.ts` define contracts/policies.
`projects/workplace-hub/src/app/core/mock-http/` extends repository/transport; core/workflow-client.ts
provides scoped mutation state; core/workflow-guards.ts provides functional route/deactivation guards.
`features/requests/{request-form,request-wizard,request-detail}` owns Reactive Forms.
`features/approvals/{approvals,approval-actions,approval-filter}` owns signals and selection.
`features/assets/{asset-create,asset-detail}` owns inventory commands and resource reads.
`projects/ui/src/lib/components/money-input.ts` owns CVA/format validation.
Feature specification, research, data model, contracts, quickstart and tasks live in this directory.

## Delivery Design

Enrich seeds with detail versions/history, preserve existing list contracts, and keep immutable
record replacement. Domain validators reject malformed bodies before writes. Each command
checks actor, current state, expected versions and relationships, then atomically replaces data.
Audit timestamps use an injectable clock and monotonically allocated IDs; reset resets counters.
HTTP writes commit inside the cancellable timer after epoch/generation checks. Old reads retain
EMPTY cancellation; canceled writes report context conflict or release UI via finalize. Empty mode
returns empty collections/missing details and rejects writes; error mode returns 503 before commit.
A successful command bumps the existing context generation to refresh reads. Page-local mutation
clients cancel on context changes, freeze command snapshots, disable repeat submissions and
release state on completion/unsubscribe. Active pages react to role changes as well as entry guards.

FormArray items and nested delivery FormGroup use shared constraints. Zoneless form.events
marks views for check. Three wizard steps use @switch, intrinsic CVA format errors, visible field
errors and an error summary. CanDeactivate protects dirty request forms; reset/identity changes
clear transient form state. linkedSignal stores eligible approval IDs and reconciles after filters,
record changes and role switches. Only verified API examples update the coverage matrix.
