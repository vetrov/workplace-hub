# Validation Guide

Use Node 22.23.2, npm 10.9.8, npm ci and npm start. App: http://localhost:4200.
Run npm run format:check, npm test -- --watch=false, npm run build and npm run build:libs.

1. Select Taylor Patel. Open Suppliers, search a seeded name/email, page and reload the query URL.
2. Open supplier details and a linked inventory asset. Create a supplier, update its contact email,
   then create an asset using it; its name appears on the resulting asset details.
3. Submit invalid contact values and inspect visible validation/focus. Cancel unsaved navigation;
   discard returns to the list. Failed writes keep values; retry succeeds. Delayed reset/identity
   changes prevent writes. Employees/managers cannot inspect contacts by direct link or role switch.
4. Open Purchasing policies and edit equipment policy. Clear category/name and submit: field errors,
   summary, focus and touched state appear. Restore a valid category/name, lower maximumTotal to 100,
   and save. Create an equipment draft costing 250; submitting fails with the policy limit. Disable
   the policy and submit successfully. Reset restores the seed and removes session edits.
5. Exercise supplier/editor/policy routes at 390px and by keyboard. Check empty/failure/missing states.
6. Re-run the employee request → manager approval → admin inventory fulfillment workflow.

See contracts/administration.md and data-model.md for exact constraints and permissions.
