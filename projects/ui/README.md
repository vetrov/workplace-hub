# UI library

Reusable signal-input status badge, generic money ControlValueAccessor/format validator and shared styles. UI has no domain business
policy. The application consumes `src/public-api.ts` through its workspace TypeScript alias
and imports the shared SCSS from its global stylesheet.

From the workspace root, run `npm run build:libs` to compile this and the domain library,
or `npm exec ng build ui` for this library alone. Output: `dist/ui`.
This is an internal project library; package publication is outside scope.
