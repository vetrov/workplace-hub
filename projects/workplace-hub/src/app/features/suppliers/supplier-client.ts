import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResult, RecordResult, SupplierDetail, SupplierView } from 'domain';

export interface SupplierQuery {
    q: string;
    page: number;
}

@Injectable()
export class SupplierMetadataInterceptor implements HttpInterceptor {
    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler,
    ): Observable<HttpEvent<unknown>> {
        return next.handle(
            request.clone({ setHeaders: { 'X-Demo-Feature': 'suppliers' } }),
        );
    }
}

@Injectable()
export class SupplierClient {
    constructor(private readonly http: HttpClient) {}

    directory(
        query: SupplierQuery,
        context: string,
    ): Observable<PageResult<SupplierDetail>> {
        return this.http.get<PageResult<SupplierDetail>>('/api/suppliers', {
            params: { q: query.q, page: query.page, context },
        });
    }

    detail(
        id: string,
        context: string,
    ): Observable<RecordResult<SupplierView>> {
        return this.http.get<RecordResult<SupplierView>>(
            `/api/suppliers/${encodeURIComponent(id)}`,
            { params: { context } },
        );
    }

    save(
        id: string | undefined,
        body: unknown,
    ): Observable<RecordResult<SupplierDetail>> {
        return id
            ? this.http.patch<RecordResult<SupplierDetail>>(
                  `/api/suppliers/${encodeURIComponent(id)}`,
                  body,
              )
            : this.http.post<RecordResult<SupplierDetail>>(
                  '/api/suppliers',
                  body,
              );
    }
}
