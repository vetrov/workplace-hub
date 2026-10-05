# Mock HTTP and UI Contracts

All endpoints are handled by the existing root functional mock interceptor; no network server is used.
Existing delay/empty/failure/context-cancellation rules apply. Errors preserve existing records.

| Method/path               | Permission          | Result/body                                                      |
| ------------------------- | ------------------- | ---------------------------------------------------------------- |
| GET /api/suppliers        | Administrator       | PageResult<SupplierDetail>; q/page/pageSize, name ascending      |
| GET /api/suppliers/:id    | Administrator       | RecordResult<SupplierView> containing supplier and linked assets |
| POST /api/suppliers       | Administrator       | SupplierInput → RecordResult<SupplierDetail>                     |
| PATCH /api/suppliers/:id  | Administrator       | SupplierInput + version → RecordResult<SupplierDetail>           |
| GET /api/supplier-options | Known demo identity | CollectionResult<Supplier> (ID/name only)                        |
| GET /api/policies         | Administrator       | CollectionResult<PurchasingPolicy>                               |
| GET /api/policies/:id     | Administrator       | RecordResult<PurchasingPolicy>                                   |
| PATCH /api/policies/:id   | Administrator       | PolicyInput + version → RecordResult<PurchasingPolicy>           |

Supplier UI: directory query URLs retain q/page; editors emit a SupplierInput intent and never write
from reusable widgets. The class interceptor adds X-Demo-Feature:suppliers and delegates to root mock.
Policy UI: native controls/custom category picker bind actual FormField; invalid submission focuses
first invalid control; save/reset operate on the model and persisted version separately.
Navigation guards offer discard/cancel while dirty and reject leaving while saves are active.
