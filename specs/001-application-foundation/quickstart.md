# Foundation validation guide

Status: planned validation steps; the app is not scaffolded yet and these commands do not run today.

## Prerequisites and planned commands

Use supported Node 22.23.2 and npm. After scaffolding creates package.json and package-lock.json:

```sh
cd /Users/avetrov/repos/workplace-hub
npm ci
npm start
```

The planned start script serves the `workplace-hub` application. Open its reported local URL.
Planned automated/build commands:

```sh
npm test -- --watch=false
npm run build
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
8. Run unit tests and production build. Record actual commands/results in tasks.md after execution.

Synthetic mock requests do not appear as real browser Network requests. Inspect application state
and unit checks; no production business server is required. Do not treat this guide as executed evidence.
