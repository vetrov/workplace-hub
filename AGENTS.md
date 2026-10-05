# Repository guidance

Read `.specify/memory/constitution.md`, `docs/angular-coverage.md`, and the active feature's
specification and plan before changing implementation.

- Preserve assigned older and newer Angular patterns. Do not modernize the whole repository.
- Implement a browser-only SPA. No SSR, hydration, or production backend.
- Keep design-system evaluation, context graph MCP integration, graph datasets, and benchmarks
  out of this task. Ordinary reusable UI and styling are in scope.
- Use one pinned Angular major, strict TypeScript/template checks, npm, and a lockfile.
- Keep feature state/services local, domain policies shared, and reusable UI free of business rules.
- Use demo identities and deterministic mock data. Do not introduce production credentials.
- Do not claim a route or pattern is implemented until working source exists and is verified.
- Track meaningful verification in the feature tasks; avoid tests that only repeat trivial code.
- New libraries and tooling must have a concrete requirement. Do not add evaluation frameworks.

All 29 planned business routes and 31 required Angular coverage entries are implemented.
Preserve older Suppliers APIs (deprecated NgIf/NgFor and explicit Default/Eager), scoped class-interceptor
forwarding, decorator queries and zoneless notifications. Policies must keep actual Signal Forms and
loaded native selection/unchanged-input retries. Preserve snapshot/version/cancellation checks,
protected assignment, historical request teams, current membership visibility and scoped report runs/export.
Keep typed projected templates, resolver EMPTY/error recovery, independently deferred chart, actual dynamic
widgets/host directives, custom controls and render hooks. Settings/category/role pages must retain their
real cross-feature effects. Milestone 5 final audit remains in progress. Consult the coverage matrix;
commit each completed step locally. User instructions take precedence.

Use the repository Prettier configuration (four spaces) and run `npm run format:check`
before committing. Keep blank lines after import groups, between top-level declarations,
between class methods, and around longer field initializers; Prettier preserves rather
than inserts those separators. Run `npm run format` after editing supported files.
