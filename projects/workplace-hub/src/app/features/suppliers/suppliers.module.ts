import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptorsFromDi,
    withRequestsMadeViaParent,
} from '@angular/common/http';
import { SupplierDirectory } from './supplier-directory';
import { SupplierDetailPage } from './supplier-detail';
import { SupplierWidgetsModule } from './supplier-widgets';
import { SupplierClient, SupplierMetadataInterceptor } from './supplier-client';

@NgModule({
    declarations: [SupplierDirectory, SupplierDetailPage],
    imports: [
        CommonModule,
        SupplierWidgetsModule,
        RouterModule.forChild([
            {
                path: '',
                component: SupplierDirectory,
                title: 'Suppliers · Workplace Hub',
            },
            {
                path: ':id',
                component: SupplierDetailPage,
                title: 'Supplier details · Workplace Hub',
            },
        ]),
    ],
    providers: [
        SupplierClient,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: SupplierMetadataInterceptor,
            multi: true,
        },
        provideHttpClient(
            withInterceptorsFromDi(),
            withRequestsMadeViaParent(),
        ),
    ],
})
export class SuppliersModule {}
