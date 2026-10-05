# Route map

Twelve of the 29 business screens below are implemented: Dashboard; request list/create/edit/
detail; approval queue/review; asset list/create/detail/assignment; and Preferences. All other
screens remain planned. Inventory creation was added to fulfill the agreed workflow milestone.
Other sections appear as explicitly planned
navigation items until implemented; do not route them to fake functional pages.

| Route | Screen | Primary access | Delivery |
| --- | --- | --- | --- |
| `/dashboard` | Dashboard | All demo identities | Foundation — implemented |
| `/requests` | Request list | Employee: own; manager: team; administrator: all | Foundation + workflow — implemented |
| `/requests/new` | Create request | Employee | Workflow — implemented |
| `/requests/:id` | Request detail/history | Authorized requester, team manager, administrator | Workflow — implemented |
| `/requests/:id/edit` | Edit draft request | Owning employee | Workflow — implemented |
| `/approvals` | Approval queue | Manager | Workflow — implemented |
| `/approvals/:id` | Review request | Relevant team manager | Workflow — implemented |
| `/assets` | Asset inventory/list | Employee: assigned; manager: team; administrator: all | Foundation + workflow — implemented |
| `/assets/new` | Create available inventory | Administrator | Workflow — implemented |
| `/assets/:id` | Asset detail | Authorized employee, team manager, administrator | Workflow — implemented |
| `/assets/:id/edit` | Edit asset | Administrator | Enterprise breadth |
| `/assets/:id/assign` | Assign asset | Administrator | Workflow — implemented |
| `/suppliers` | Supplier directory | Administrator | Angular coverage |
| `/suppliers/new` | Create supplier | Administrator | Angular coverage |
| `/suppliers/:id` | Supplier detail/contacts | Administrator | Angular coverage |
| `/suppliers/:id/edit` | Edit supplier | Administrator | Angular coverage |
| `/people` | People directory | All demo identities | Enterprise breadth |
| `/people/:id` | Employee profile | All demo identities | Enterprise breadth |
| `/teams` | Teams | Manager, administrator | Enterprise breadth |
| `/teams/:id` | Team membership | Manager: own team; administrator: all | Enterprise breadth |
| `/reports` | Saved reports | Manager, administrator | Enterprise breadth |
| `/reports/new` | Configure report | Manager, administrator | Enterprise breadth |
| `/reports/:id` | Report results | Report owner, administrator | Enterprise breadth |
| `/administration/policies` | Policy list | Administrator | Angular coverage |
| `/administration/policies/:id/edit` | Policy editor | Administrator | Angular coverage |
| `/administration/roles` | Role configuration | Administrator | Enterprise breadth |
| `/administration/categories` | Request categories | Administrator | Enterprise breadth |
| `/administration/settings` | Organization settings | Administrator | Enterprise breadth |
| `/preferences` | User preferences | All demo identities | Foundation — implemented |

Redirect `/` to `/dashboard`. Unknown paths show an accessible not-found page. An access-denied helper is available at
`/access-denied`; functional entry guards protect employee creation/editing, manager reviews and administrator
inventory actions. Active pages also react to identity changes; request forms have an unsaved guard. Helper pages are not part of the 29-screen count.
Declare literal paths such as `new` before parameter paths such as `:id`. Preserve list filters,
sort, and pagination in query parameters. Static hosting must provide SPA history fallback.

Preference values are appearance and density choices; they are ordinary application settings.
