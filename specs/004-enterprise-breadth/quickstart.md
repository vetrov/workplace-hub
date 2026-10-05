# Validation Guide

From repository: npm ci; npm start. Select required demo identity. All changes are local and resettable.
Run npm run format:check; npm test -- --watch=false; npm run build; npm run build:libs.

1. People: search/page by URL, inspect a colleague; hidden requests/assets must not appear in employee profiles.
2. Teams: manager sees only own team; admin transfers eligible colleague, membership/inventory scope updates;
   protected/stale transfers fail. Reset restores all80 people across12 teams.
3. Inventory: admin edits available asset to maintenance, assignment disappears; restore available. Assigned
   assets retain type/links. Invalid/stale/failed writes retain form; dirty cancel and pending role/reset work.
4. Reports: manager creates status/person-filtered report, opens saved URL, loads visualization, exports CSV;
   admin sees all, employee denied. Totals/export honor filters and current permissions.
5. Administration: disable manager create/export and verify effects; disable equipment, submit fails but draft
   saves; rename organization/default assets and inspect shell/new-report defaults. Reset restores seed.
6. All new routes: loading/empty/error/retry/missing/permissions, keyboard/native custom control focus/selection,
   direct URL reload and390px no horizontal page overflow. Rerun existing request-to-asset/Suppliers/policy flow.
