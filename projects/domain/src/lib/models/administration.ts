import {
    AssetSummary,
    DemoIdentity,
    RequestCategory,
    Supplier,
} from './foundation';
import { WorkflowStore } from './workflow';

export interface SupplierInput {
    name: string;
    contactName: string;
    email: string;
    phone: string;
    notes: string;
}

export interface SupplierDetail extends SupplierInput {
    readonly id: string;
    readonly version: number;
}

export interface SupplierView {
    readonly supplier: SupplierDetail;
    readonly assets: readonly AssetSummary[];
}

export interface PolicyInput {
    name: string;
    category: RequestCategory;
    maximumTotal: number;
    enabled: boolean;
    notes: string;
}

export interface PurchasingPolicy extends PolicyInput {
    readonly id: string;
    readonly version: number;
}

export interface AdministrationStore extends WorkflowStore {
    suppliers(actor: DemoIdentity): readonly SupplierDetail[];
    supplier(id: string, actor: DemoIdentity): SupplierView;
    supplierOptions(actor: DemoIdentity): readonly Supplier[];
    createSupplier(input: unknown, actor: DemoIdentity): SupplierDetail;
    updateSupplier(
        id: string,
        input: unknown,
        actor: DemoIdentity,
    ): SupplierDetail;
    policies(actor: DemoIdentity): readonly PurchasingPolicy[];
    policy(id: string, actor: DemoIdentity): PurchasingPolicy;
    updatePolicy(
        id: string,
        input: unknown,
        actor: DemoIdentity,
    ): PurchasingPolicy;
}
