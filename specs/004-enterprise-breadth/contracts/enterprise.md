# Mock HTTP Contract

Uses existing 250ms/2s scenarios, contextKey envelopes, immutable body snapshots and typed 400/403/404/409/503 errors.
Reads return CollectionResult<T>/RecordResult<T> except paged directory. Versions required for PATCH/transfer;
actor authorization precedes body validation. Reset/identity/generation change cancels pending commands.

| Endpoint                   | Method    | Behavior                                                          |
| -------------------------- | --------- | ----------------------------------------------------------------- |
| /api/people?q=&page=       | GET       | all known actors;25-row directory                                 |
| /api/people-options        | GET       | known actors; full Person collection for feature-filtered pickers |
| /api/people/:id            | GET       | profile and authorized links                                      |
| /api/teams                 | GET       | manager own/admin all                                             |
| /api/teams/:id             | GET       | scoped detail/membership                                          |
| /api/teams/:id/transfer    | POST      | admin;personId/fromTeamId/version                                 |
| /api/assets/:id            | PATCH     | admin;AssetInput/status/version                                   |
| /api/reports               | GET/POST  | scoped list/create validated definition                           |
| /api/reports/:id           | GET       | owner/admin;live authorized results                               |
| /api/reports/:id/export    | GET       | owner/admin+capability;CSV RecordResult<string>                   |
| /api/organization          | GET       | all known actors;safe name/default/capability/category summary    |
| /api/config/roles          | GET/PATCH | admin;versioned manager flags                                     |
| /api/config/categories     | GET       | admin;fixed three records                                         |
| /api/config/categories/:id | PATCH     | admin;label/enabled/version                                       |
| /api/config/settings       | GET/PATCH | admin;organizationName/defaultReportDataset/version               |

UI: 11 new routes in route-map, dirty guards on all editors, status/error/retry semantics, keyboard-accessible
native controls and recovery links. Resolver failures render an actionable result page rather than abort navigation.
