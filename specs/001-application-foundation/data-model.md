# Foundation data model

All records are browser-local simulation. Business data is read-only in this feature.

| Entity             | Fields and constraints                                                                                                                                                                                                                                         | Relationships                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Person             | `id`: unique nonempty string; `name`: nonempty string; `email`: valid email; `teamId`: existing team                                                                                                                                                           | Belongs to one team                                                                      |
| Team               | `id`: unique nonempty string; `name`: nonempty string; `managerId`: existing person in this team                                                                                                                                                               | Contains people                                                                          |
| DemoIdentity       | `personId`: existing person; `role`: employee, manager, or administrator; `teamId`: person's team                                                                                                                                                              | Three selectable seeded identities                                                       |
| Supplier           | `id`: unique nonempty string; `name`: nonempty string                                                                                                                                                                                                          | Supplies zero or more assets                                                             |
| RequestSummary     | `id`: unique nonempty string; `title`: nonempty string; `requesterId`: existing person; `teamId`: requester's team; `category`: equipment, software, or service; `status`: draft, submitted, approved, rejected, or fulfilled; `createdAt`: valid ISO datetime | Requester and team; assigned asset detail added later                                    |
| AssetSummary       | `id`: unique nonempty string; `name`: nonempty string; `type`: equipment or software; `status`: available, assigned, maintenance, or retired; `supplierId`: existing supplier; `assigneeId`: existing person or null                                           | Assigned status requires assignee; other statuses have null assignee in foundation seeds |
| DisplayPreferences | `appearance`: light or dark; `density`: comfortable or compact                                                                                                                                                                                                 | Defaults: light and comfortable                                                          |
| ListQuery          | `q`: string; `sort`: allowed field/direction; `page`: positive integer; `pageSize`: 25, 50, or 100                                                                                                                                                             | Defaults: empty query, page 1, pageSize 25; sort depends on list                         |
| ScenarioState      | `mode`: normal, empty, delayed, or error; `generation`: increasing integer                                                                                                                                                                                     | Invalidates previous response generations                                                |

## Seed invariants

Create exactly 80 people, 12 teams, 40 suppliers, 250 requests, and 2,000 assets. Every referenced
identifier exists. Every team has a manager belonging to it. Each demo identity has at least one
visible request and asset in the normal scenario. Seed identifiers and dates derive from fixed
constants, not the system clock or unseeded random values. Reset clones immutable seeds.

## Visibility

- Employee requests: `requesterId` equals selected person; assets: `assigneeId` equals selected person.
- Manager requests: `teamId` equals selected team; assets: assignee belongs to selected team.
- Administrator: all requests and assets.
- Apply visibility before search, sort, paging, and total count computation.

## State transitions

Foundation has no request or asset mutation operations. Scenario mode can change; reset returns
mode to normal and increments generation. Identity change invalidates pending visible records.
Preference save validates enum values; persistence failure retains usable session state.
