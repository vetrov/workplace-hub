# Domain library

Shared contracts, query normalization, and demo visibility rules. There is no presentation
or app-service dependency. The application consumes `src/public-api.ts` through its workspace
TypeScript alias. Visibility behavior is exercised by the application repository tests.

From the workspace root, run `npm run build:libs` to compile this and the UI library,
or `npm exec ng build domain` for this library alone. Output: `dist/domain`.
This is an internal project library; package publication is outside scope.
