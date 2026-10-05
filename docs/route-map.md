# Route map

All 29 business screens below are implemented and verified. Navigation links open working features;
role entry guards and reactive views enforce the demo identity's permissions.

| Route                               | Screen                     | Primary access                                        | Delivery                            |
| ----------------------------------- | -------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `/dashboard`                        | Dashboard                  | All demo identities                                   | Foundation — implemented            |
| `/requests`                         | Request list               | Employee: own; manager: team; administrator: all      | Foundation + workflow — implemented |
| `/requests/new`                     | Create request             | Employee                                              | Workflow — implemented              |
| `/requests/:id`                     | Request detail/history     | Authorized requester, team manager, administrator     | Workflow — implemented              |
| `/requests/:id/edit`                | Edit draft request         | Owning employee                                       | Workflow — implemented              |
| `/approvals`                        | Approval queue             | Manager                                               | Workflow — implemented              |
| `/approvals/:id`                    | Review request             | Relevant team manager                                 | Workflow — implemented              |
| `/assets`                           | Asset inventory/list       | Employee: assigned; manager: team; administrator: all | Foundation + workflow — implemented |
| `/assets/new`                       | Create available inventory | Administrator                                         | Workflow — implemented              |
| `/assets/:id`                       | Asset detail               | Authorized employee, team manager, administrator      | Workflow — implemented              |
| `/assets/:id/edit`                  | Edit asset                 | Administrator                                         | Enterprise breadth — implemented    |
| `/assets/:id/assign`                | Assign asset               | Administrator                                         | Workflow — implemented              |
| `/suppliers`                        | Supplier directory         | Administrator                                         | Angular coverage — implemented      |
| `/suppliers/new`                    | Create supplier            | Administrator                                         | Angular coverage — implemented      |
| `/suppliers/:id`                    | Supplier detail/contacts   | Administrator                                         | Angular coverage — implemented      |
| `/suppliers/:id/edit`               | Edit supplier              | Administrator                                         | Angular coverage — implemented      |
| `/people`                           | People directory           | All demo identities                                   | Enterprise breadth — implemented    |
| `/people/:id`                       | Employee profile           | All demo identities                                   | Enterprise breadth — implemented    |
| `/teams`                            | Teams                      | Manager, administrator                                | Enterprise breadth — implemented    |
| `/teams/:id`                        | Team membership            | Manager: own team; administrator: all                 | Enterprise breadth — implemented    |
| `/reports`                          | Saved reports              | Manager, administrator                                | Enterprise breadth — implemented    |
| `/reports/new`                      | Configure report           | Manager, administrator                                | Enterprise breadth — implemented    |
| `/reports/:id`                      | Report results             | Report owner, administrator                           | Enterprise breadth — implemented    |
| `/administration/policies`          | Policy list                | Administrator                                         | Angular coverage — implemented      |
| `/administration/policies/:id/edit` | Policy editor              | Administrator                                         | Angular coverage — implemented      |
| `/administration/roles`             | Role configuration         | Administrator                                         | Enterprise breadth — implemented    |
| `/administration/categories`        | Request categories         | Administrator                                         | Enterprise breadth — implemented    |
| `/administration/settings`          | Organization settings      | Administrator                                         | Enterprise breadth — implemented    |
| `/preferences`                      | User preferences           | All demo identities                                   | Foundation — implemented            |

Redirect `/` to `/dashboard`. Unknown paths show an accessible not-found page. An access-denied helper is available at
`/access-denied`; functional entry guards protect employee creation/editing, manager reviews and administrator
inventory actions, supplier administration and purchasing policies. Active pages react to identity changes;
request, supplier, policy, team transfer, asset creation/maintenance, report configuration and organization editors
protect unsaved changes and pending saves. Helper pages are not part of the 29-screen count.
Declare literal paths such as `new` before parameter paths such as `:id`. Preserve list filters,
sort, and pagination in query parameters. Static hosting must provide SPA history fallback.

Preference values are appearance and density choices; they are ordinary application settings.

Page changes focus the rendered content heading, preserving feature-provided initial field focus.
Initial load, query/fragment-only navigation and background reads retain focus. Skip to content focuses
main; request steps and invalid native/custom-control fields receive render-timed focus. Pagination
controls remain mounted across list loading, use aria-disabled with guarded actions, and preserve
keyboard focus without exposing obsolete scoped rows. See [verification](verification.md).
