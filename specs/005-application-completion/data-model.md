# Data Model: Application Completion

No business records, seed relationships, API fields or versions change.

Editor state: typed form with valid/dirty status; scoped WorkflowClient busy/error state.
Pristine + idle permits leaving; dirty + idle asks discard; busy blocks leaving; successful
save marks pristine and navigates after busy=false. Context/reset destroys pending transport/draft.

Navigation state: most recent successful path (query/fragment excluded), current rendered route;
initial path establishes baseline without focus movement. A different completed path schedules
one render callback; canceled/denied/superseded navigation does not focus obsolete content.

Wizard state: details (1), items (2), review (3). Valid current step advances; invalid current
step stays and focuses its first invalid native input. Back moves to the previous step and its
first field. Invalid save returns to the earliest invalid step. The review heading is programmatically
focusable but is not in the tab order. Existing controls/domain validation remain authoritative.
