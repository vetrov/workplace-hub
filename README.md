# Workplace Hub

Browser-only Angular enterprise application with intentionally varied Angular patterns.
The business domain is equipment requests, approvals, suppliers, and asset management.

## Status

Scope and architecture are documented. Spec Kit 1.1.0 is initialized for repository-local
Codex skills. Angular source, npm dependencies, and runnable scripts are not created yet.

## Planning

- [Project constitution](.specify/memory/constitution.md)
- [Product overview](docs/product-overview.md)
- [Implementation roadmap](docs/implementation-roadmap.md)
- [Route map](docs/route-map.md)
- [Angular coverage matrix](docs/angular-coverage.md)
- [Architecture decision](docs/architecture/0001-app-architecture.md)
- [First feature](specs/001-application-foundation/spec.md)

The next implementation step is the application foundation: scaffold Angular, build the shell,
and add demo roles, mock HTTP, seed data, and reproducible scenarios.

Design-system evaluation and context graph evaluation/integration are outside this task.

## Spec Kit

Project skills live in `.agents/skills/`. Use the constitution once, then specification, plan,
tasks, implementation, and convergence per feature. The active feature is recorded in
`.specify/feature.json`. The CLI was used from an isolated setup environment and is not globally
installed. For later CLI setup, follow the official installation instructions with version 1.1.0.

Source: https://github.github.com/spec-kit/installation.html
