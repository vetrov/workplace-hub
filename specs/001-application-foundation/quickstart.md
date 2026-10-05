# Foundation validation guide

Status: foundation implemented and verified. Commands below work; recorded execution evidence is in tasks.md.

## Prerequisites and commands

Use Node 22.23.2 (`.nvmrc`) and npm 10.9.8 with the committed lockfile:

```sh
cd /Users/avetrov/repos/workplace-hub
npm ci
npm start
```

The start script serves the `workplace-hub` application at http://localhost:4200 by default.
Automated/build commands:

```sh
npm test -- --watch=false
npm run build
npm run build:libs
```

## Validation scenarios

1. Navigate Dashboard, Requests, Assets, and Preferences; reload each direct URL. Confirm title,
   active navigation, and unknown-path recovery. Planned navigation must not imply working features.
2. Select each demo identity. Verify list items and totals against visibility rules in
   [data-model.md](data-model.md). Switch during loading; previous identity's items must disappear.
3. Select empty, delayed, and error scenarios on both lists. Verify readable empty/loading/error
   states. Retry restores normal responses. Reset three times and verify fixed counts/identifiers.
4. Reset during a delayed response; obsolete data must not replace the new results.
5. Search, sort, and page lists. Confirm query URL synchronization and normalization of invalid values.
6. Save appearance and density; navigate and refresh. Simulate unavailable storage and verify defaults
   and usable session-only preference changes.
7. Operate all controls by keyboard; confirm visible focus, labels, and clear feedback.
8. Run unit tests and production build. The most recent recorded results are in tasks.md; record new results after behavior changes.

Synthetic mock requests do not appear as real browser Network requests. Inspect application state
and unit checks; no production business server is required. Use tasks.md for executed evidence; this guide describes repeatable validation steps.
