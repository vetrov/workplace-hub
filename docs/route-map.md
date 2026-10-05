# Route map

All 28 business screens below are planned, not implemented. The foundation implements Dashboard,
read-only Requests and Assets lists, and Preferences. Other sections appear as explicitly planned
navigation items until implemented; do not route them to fake functional pages.

| Route | Screen | Primary access | Delivery |
| --- | --- | --- | --- |
| `/dashboard` | Dashboard | All demo identities | Foundation |
| `/requests` | Request list | Employee: own; manager: team; administrator: all | Foundation read-only; workflow adds actions |
| `/requests/new` | Create request | Employee | Workflow |
| `/requests/:id` | Request detail/history | Authorized requester, team manager, administrator | Workflow |
| `/requests/:id/edit` | Edit draft request | Owning employee | Workflow |
| `/approvals` | Approval queue | Manager | Workflow |
| `/approvals/:id` | Review request | Relevant team manager | Workflow |
| `/assets` | Asset inventory/list | Employee: assigned; manager: team; administrator: all | Foundation read-only; workflow adds actions |
| `/assets/:id` | Asset detail | Authorized employee, team manager, administrator | Workflow |
| `/assets/:id/edit` | Edit asset | Administrator | Enterprise breadth |
| `/assets/:id/assign` | Assign asset | Administrator | Workflow |
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
| `/preferences` | User preferences | All demo identities | Foundation |

Redirect `/` to `/dashboard`. Handle unknown paths with an accessible not-found page; handle
restricted paths with an access-denied page. Helper pages are not part of the 28-screen count.
Declare literal paths such as `new` before parameter paths such as `:id`. Preserve list filters,
sort, and pagination in query parameters. Static hosting must provide SPA history fallback.

Preference values are appearance and density choices; they are ordinary application settings.
