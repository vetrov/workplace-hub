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

The foundation, request-to-asset workflow, NgModule Suppliers and actual Signal Forms purchasing
policies are implemented and verified. Preserve older APIs in Suppliers, including deprecated
NgIf/NgFor and the explicit Default/Eager card; Angular 22 still supports them. Preserve scoped
class-interceptor forwarding, decorator queries and zoneless notifications. Policies must use
actual @angular/forms/signals, and their custom picker must display initially loaded values.
Preserve unchanged-value failed-save retries, actor/version/transition ordering, atomic assignment,
policy checks on future submissions and reset/identity cancellation. People/Teams, Reports,
asset editing, remaining administration and unbuilt coverage entries remain planned. Consult the
coverage matrix. Commit each completed step locally; user instructions take precedence.

Use the repository Prettier configuration (four spaces) and run `npm run format:check`
before committing. Keep blank lines after import groups, between top-level declarations,
between class methods, and around longer field initializers; Prettier preserves rather
than inserts those separators. Run `npm run format` after editing supported files.
