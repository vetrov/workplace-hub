# Data Model

## SupplierDetail and SupplierInput

SupplierDetail extends the existing ID/name with contactName, email, phone, notes and version.
Name and contactName: trimmed 3–100 characters. Email: trimmed 3–160 characters and a valid
non-whitespace local/domain form. Phone: optional trimmed text, at most 40 characters.
Notes: optional trimmed text, at most 1000 characters. Names are unique case-insensitively.
Create assigns S041 onward; update checks a positive integer version and advances it once.
Reset restores S001–S040 and version 1. Supplier IDs on existing/new assets remain stable.

## PurchasingPolicy and PolicyInput

Three seeded policy IDs: POL-equipment, POL-software, POL-service. Each has a trimmed 3–100
character name, category equipment/software/service, finite maximumTotal 0.01–10000000 with
at most two decimal places, boolean enabled, notes at most 1000 characters and version.
Update checks a positive integer version and advances it once. No create/delete endpoints.
Enabled policies constrain future submitted request totals; same-category policies combine by the
minimum total. Drafts and already approved/fulfilled records are unaffected. Reset restores version 1
and seeded limits (equipment 50000, software 50000, service 50000).

## Response and context

Existing RecordResult/CollectionResult/PageResult contracts retain contextKey. Supplier detail response
includes related asset summaries, capped in the view rather than mutating data. Name options omit contacts.
Every write checks the current authorized actor, command body, versions and constraints before mutation.
