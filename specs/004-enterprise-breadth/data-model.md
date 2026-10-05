# Data Model

- PersonView: existing Person, Team, authorized requests/assets. No profile exposes another actor's hidden work.
- TeamView: Team plus version, current members, manager-authorized requests/assets. Transfer input personId,
  fromTeamId, target version; both source/target advance. Managers/demo IDs fixed. Membership has one team per person.
- AssetUpdate: AssetInput + status/version. Assigned records cannot change type/status; unassigned status accepts
  available/maintenance/retired. ID, allocation and history preserved; updated audit event appended.
- ReportInput: trimmed name 3–100, dataset requests/assets, status empty or known dataset status, personId empty
  or existing authorized person. SavedReport adds id, ownerId, version=1. No editing/deletion in this slice.
- ReportRun: report, total, buckets {label,count}, rows {id,label,status,personId}; rows limited to first100.
- RoleConfiguration: managerCanCreateReports, managerCanExportReports (booleans), version; administrator fixed.
- RequestCategoryConfig: id equipment/software/service, label 3–60 unique case-insensitive, enabled boolean, version.
- OrganizationSettings: organizationName 3–80, defaultReportDataset requests/assets, version.
- OrganizationSummary: public name/default dataset plus manager capabilities and category names/enabled only.
- Four deterministic seed reports (two for manager, two for administrator). All updates frozen/resettable.
