# Workflow data model

RequestDetail extends RequestSummary with version (positive integer), justification, delivery,
items, allocatedAssetId (nullable) and history. AssetDetail extends AssetSummary with version,
serialNumber, notes, requestId (nullable) and history. AuditEvent has unique ID, actor ID,
ISO timestamp, action and note. Seed snapshots use a seeded event; subsequent events identify
actual demo actors. Existing fulfilled seeds have no fabricated allocation link.

Validation: title "3–100 trimmed characters"; justification "10–2,000 trimmed characters";
location "3–120 trimmed characters"; neededBy "valid YYYY-MM-DD calendar date";
category "equipment or software" for new/edit commands; items "1–10 items"; description
"3–120 trimmed characters"; quantity "integer 1–100"; unitCost "0.01–100,000 with at most
two decimal places". Total is the sum of quantity × rounded integer cents. Inventory name
"3–100 trimmed characters", serialNumber "3–80 trimmed characters", notes "0–1,000 characters",
type "equipment or software", supplierId "existing supplier ID". Rejection reason
"3–500 trimmed characters"; optional approval reason "0–500 trimmed characters".

Transitions: employee-owned draft → updated draft or submitted; relevant team manager other
than requester: submitted → approved/rejected; administrator: approved → fulfilled linked to one
available asset of the matching equipment/software type. Asset available → assigned with
requester/linked request. Create available unassigned inventory as administrator only. Every edit,
decision or fulfillment requires the expected positive record version and increments it.
Any invalid/forbidden/stale command changes no record, allocation or event. Reset restores counts,
seed versions/history, null allocation links and new-record counters.
