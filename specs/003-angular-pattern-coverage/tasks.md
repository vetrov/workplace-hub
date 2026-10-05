# Tasks: Suppliers and Purchasing Policies

**Input**: spec.md, plan.md, research.md, data-model.md and contracts/administration.md.
**Organization**: Dependency-ordered phases and independently verifiable user stories.

## Phase 1: Setup

- [x] T001 Specify and research the feature; create plan/contracts/checklist/validation guide in specs/003-angular-pattern-coverage/.

## Phase 2: Shared foundations

- [x] T002 Implement contracts/domain validators in projects/domain/src/lib/{models,policies}/administration.ts; write focused administration-domain.spec.ts first. Supplier name/contactName trimmed 3–100, email 3–160 and valid, phone at most 40, notes at most 1000; policy name 3–100, category equipment/software/service, maximumTotal 0.01–10000000 with at most two decimals, enabled boolean; positive integer versions.
- [x] T003 Implement immutable administration-repository.ts and extend mock.interceptor.ts; write administration.spec.ts/administration-http.spec.ts first for actor checks, unique supplier names, stale versions, policy submission effects and delayed context cancellation; reset restores 40 suppliers/3 policies.

## Phase 3: US1 — Find suppliers

**Independent verification**: Administrator directory query/paging/details/linked assets; permission and response states.

- [x] T004 [US1] Implement features/suppliers/suppliers.module.ts, supplier-client.ts, supplier-facade.ts, supplier-directory.ts, supplier-detail.ts and decorator card/widgets module; root lazy route/navigation; verify class metadata interceptor parent forwarding, AsyncPipe/BehaviorSubject state and zoneless Default card behavior.

## Phase 4: US2 — Maintain contacts

**Independent verification**: Supplier create/edit/conflicts; dirty navigation; identity/reset cancellation and invalid-control focus.

- [ ] T005 [US2] Implement supplier-editor.ts, supplier-edit-page.ts, projected field/query directives and editor guard in features/suppliers/; write meaningful input/query/form tests first; wire new/edit routes, lifecycle/constructor DI and EventEmitter intent.

## Phase 5: US3 — Purchasing policies

**Independent verification**: Schema/custom control validation and touched/dirty/save/reset; limit effect on future submissions.

- [ ] T006 [US3] Implement projects/ui/src/lib/components/category-picker.ts and features/administration/{policy-list,policy-editor}.ts with actual Signal Forms/form/schema/FormField/submit, viewChild/focus control, admin and unsaved guards; write focused custom-control/editor tests first.

## Phase 6: Integration and verification

- [ ] T007 Connect current suppliers to inventory options/names through core/workflow-read.ts and features/assets/{asset-create,asset-detail}.ts; verify new supplier selection and rename propagation with permission-safe name-only responses.
- [ ] T008 Audit spec/plan/tasks and update README.md, AGENTS.md, docs/{route-map,angular-coverage,implementation-roadmap}.md; run formatting/unit/app/library and isolated Chrome principal/new workflows, response/permission/cancellation/keyboard/390px checks; record evidence here and commit locally.

## Dependencies and execution

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008. Domain and shared transport block both stories;
Suppliers is the first usable slice, policies can be verified independently after shared transport.
Supplier/policy read-only research can run in parallel; writes to root routes/mock dispatcher are sequential.
Each task is a completed local commit. Tests are part of the owning implementation task and are written first;
no deliberately failing suite is committed. No deployment or remote PR is requested.

## Verification evidence

T001: Spec quality checklist 8/8 passed; API research verified against installed Angular 22.2.1 declarations/runtime
and official documentation. Constitution pre/post-design checks pass. No extension hooks configured.

T002: 66 tests passed, including 19 new malformed-contact, policy-money, draft and combined-limit checks; no new dependencies.

T003: 80 tests passed; contacts/known actors, duplicate names, stale versions, policy limits, deterministic reset and delayed/unsubscribed HTTP writes verified.

T004: 82 tests and production build passed; Chrome verified paging/query search, linked inventory and immediate role clearing. Unit checks prove aliased inputs/transform/Default rendering and lazy class-interceptor metadata reaching the root mock.
