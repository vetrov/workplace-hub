# Workflow validation guide

Use Node 22.23.2/npm 10.9.8. In `~/repos/workplace-hub`: `npm ci`, `npm start`.
Run `npm test -- --watch=false`, `npm run build`, `npm run build:libs`.

1. As Alex Garcia, create a request with nested delivery and repeated cost items. Verify invalid
   quantity/date/cost errors, remove an item, save draft, edit and submit. Inspect history/total.
2. Change a draft and navigate away: cancel keeps input; discard permits leaving.
3. As Alex Chen, filter/select team submissions, approve the new request; reject another with
   a reason. Verify queue reconciliation and details/history. Employee/admin queue links are denied.
4. As Taylor Patel, create compatible available inventory and assign it to the approved request.
   Both records link together and the employee sees the assigned asset and fulfilled request.
5. Attempt duplicate/incompatible/stale writes in focused tests; neither record nor history changes.
6. Select failure/delay/empty scenarios; failed writes preserve input. Reset/switch role during a
   delayed save/decision/assignment; pending state releases and obsolete data never commits.
7. Reload direct detail/edit/review/assignment URLs, inspect missing IDs and forbidden access;
   role changes on an active route immediately hide inaccessible details/actions.
8. Check keyboard labels/focus and narrow layouts. Refresh/reset restores enriched seeds.

This is repeatable guidance; tasks.md records executed evidence after implementation.
