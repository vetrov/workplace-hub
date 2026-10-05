# Local workflow HTTP contracts

GET `/api/requests/:id` and `/api/assets/:id`: `{record, contextKey}` or 403/404.
GET `/api/approvals`: `{items, contextKey}` of reviewable submitted team requests, manager only.
GET `/api/assignment-options?assetId=...`: `{items, contextKey}` of compatible approved requests,
administrator only. Existing `/api/requests`, `/api/assets`, `/api/dashboard` contracts remain.
POST `/api/requests`: valid request input plus status draft/submitted; returns `{record, contextKey}`.
PATCH `/api/requests/:id`: request input plus status draft/submitted and expected version; owned draft only.
POST `/api/requests/:id/decision`: decision approve/reject, reason and expected version; relevant manager only.
POST `/api/assets`: inventory input; returns new available unassigned asset.
POST `/api/assets/:id/assign`: requestId, requestVersion and assetVersion; returns linked fulfilled
request and assigned asset in `{record: {request, asset}, contextKey}`.

Errors: 400 invalid fields/body, 403 role/scope denial, 404 missing path/record, 405 unsupported
method, 409 stale version/invalid transition/incompatible assignment/context change/empty-mode write,
503 selected failure scenario. No forwarding. Unsubscribe cancels writes before commit; reset/identity
changes invalidate pending writes. Error/empty scenarios never commit a command. Details are missing
in empty mode. Successful mutations update current context so retained resources refresh.
