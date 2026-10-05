# Validation Quickstart: Application Completion

Use the Node/npm versions in README. Run npm ci, npm start, npm test -- --watch=false,
npm run build, npm run build:libs and npm run format:check from the repository.

1. As employee Alex Garcia, create a request. Try Continue with empty fields: focus title.
   Fill details, Continue: focus first item description. Invalid money input receives focus.
   Continue to review: focus heading; Back focuses first item. Cancel/discard dirty navigation.
2. Use Delayed response and save a valid request: Back to requests/main navigation must remain
   on the pending editor without discard prompt. Successful save opens its details.
3. As administrator Taylor Patel, create an asset. Invalid save focuses name. Dirty navigation
   cancels/discards; delayed save prevents leaving and success opens inventory details.
4. Keyboard-activate a main navigation link: new page content receives focus. Filter/page query
   changes retain active control. Native skip link focuses main. Suppliers keeps initial field focus.
5. Follow all 29 routes in docs/route-map.md with an authorized demo identity, reload and inspect
   title/heading/main/labels at desktop and 390px. Check dark/compact Preferences and helper pages.
6. Repeat request→approval→assignment, Suppliers/policies and enterprise connected stories in
   prior feature quickstarts, including empty/error/retry/permission/reset/identity cancellation.
7. Audit all 31 source examples in docs/angular-coverage.md and final evidence in docs/verification.md.

Keep connected mutations inside SPA links: full reload restores in-memory business seed data.
Static production preview must provide history fallback; it serves client files and does not use SSR.

Pagination audit: as administrator, keyboard-activate Next in Requests/Assets/People/Suppliers.
Focus remains on Next after loading; repeat Previous. On People/Suppliers use ?page=999 to verify
last-page normalization and Previous. aria-disabled actions do not navigate during loading or beyond
bounds. Results clear on context changes; controls remain mounted without retaining obsolete rows.
