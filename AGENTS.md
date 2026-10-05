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

The application foundation is implemented and verified. Later workflow and enterprise features
remain planned; consult the coverage matrix before treating an example as implemented. Commit
each completed implementation step to local Git, as requested by the user. User instructions
take precedence over repository guidance.
