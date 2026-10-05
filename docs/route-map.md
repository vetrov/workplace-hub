# Route map

Eighteen of the 29 business screens below are implemented: foundation/workflow, all four Suppliers
screens and the purchasing policy list/editor. The remaining 11 screens are next in enterprise breadth.
Navigation distinguishes working features from planned sections.

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
| `/assets/:id/edit`                  | Edit asset                 | Administrator                                         | Enterprise breadth                  |
| `/assets/:id/assign`                | Assign asset               | Administrator                                         | Workflow — implemented              |
| `/suppliers`                        | Supplier directory         | Administrator                                         | Angular coverage — implemented      |
| `/suppliers/new`                    | Create supplier            | Administrator                                         | Angular coverage — implemented      |
| `/suppliers/:id`                    | Supplier detail/contacts   | Administrator                                         | Angular coverage — implemented      |
| `/suppliers/:id/edit`               | Edit supplier              | Administrator                                         | Angular coverage — implemented      |
| `/people`                           | People directory           | All demo identities                                   | Enterprise breadth                  |
| `/people/:id`                       | Employee profile           | All demo identities                                   | Enterprise breadth                  |
| `/teams`                            | Teams                      | Manager, administrator                                | Enterprise breadth                  |
| `/teams/:id`                        | Team membership            | Manager: own team; administrator: all                 | Enterprise breadth                  |
| `/reports`                          | Saved reports              | Manager, administrator                                | Enterprise breadth                  |
| `/reports/new`                      | Configure report           | Manager, administrator                                | Enterprise breadth                  |
| `/reports/:id`                      | Report results             | Report owner, administrator                           | Enterprise breadth                  |
| `/administration/policies`          | Policy list                | Administrator                                         | Angular coverage — implemented      |
| `/administration/policies/:id/edit` | Policy editor              | Administrator                                         | Angular coverage — implemented      |
| `/administration/roles`             | Role configuration         | Administrator                                         | Enterprise breadth                  |
| `/administration/categories`        | Request categories         | Administrator                                         | Enterprise breadth                  |
| `/administration/settings`          | Organization settings      | Administrator                                         | Enterprise breadth                  |
| `/preferences`                      | User preferences           | All demo identities                                   | Foundation — implemented            |

Redirect `/` to `/dashboard`. Unknown paths show an accessible not-found page. An access-denied helper is available at
`/access-denied`; functional entry guards protect employee creation/editing, manager reviews and administrator
inventory actions, supplier administration and purchasing policies. Active pages react to identity changes;
request, supplier and policy editors protect unsaved changes and pending saves. Helper pages are not part of the 29-screen count.
Declare literal paths such as `new` before parameter paths such as `:id`. Preserve list filters,
sort, and pagination in query parameters. Static hosting must provide SPA history fallback.

Preference values are appearance and density choices; they are ordinary application settings.
