import {
    createEnvironmentInjector,
    EnvironmentInjector,
    inject,
} from '@angular/core';
import {
    HttpClient,
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptors,
    withInterceptorsFromDi,
    withRequestsMadeViaParent,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SupplierDetail, PageResult } from 'domain';
import { SupplierClient, SupplierMetadataInterceptor } from './supplier-client';
import { SupplierCard, SupplierWidgetsModule } from './supplier-widgets';
import { mockInterceptor } from '../../core/mock-http/mock.interceptor';
import {
    DEMO_SESSION,
    REPOSITORY,
    MockRepository,
} from '../../core/mock-http/mock-repository';
import { DEMO_IDENTITIES } from '../../core/mock-http/seed-data';

const record: SupplierDetail = {
    id: 'S041',
    name: 'Nordic Devices',
    contactName: 'Dana Smith',
    email: 'dana@nordic.example',
    phone: '',
    notes: '',
    version: 1,
};

describe('legacy supplier component and HTTP profile', () => {
    it('runs aliased decorator inputs, transform and ngOnChanges in a zoneless Default card', async () => {
        TestBed.configureTestingModule({ imports: [SupplierWidgetsModule] });
        const fixture = TestBed.createComponent(SupplierCard);
        fixture.componentRef.setInput('record', record);
        fixture.componentRef.setInput('readOnly', '');
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain('Nordic Devices');
        expect(fixture.componentInstance.readonlyMode).toBe(true);
        fixture.componentRef.setInput('record', {
            ...record,
            name: 'Updated Devices',
        });
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain('Updated Devices');
        const emitted = vi.fn();
        fixture.componentInstance.editRequested.subscribe(emitted);
        fixture.componentRef.setInput('readOnly', false);
        await fixture.whenStable();
        fixture.nativeElement.querySelector('button').click();
        expect(emitted).toHaveBeenCalledWith('S041');
    });

    it('executes the lazy class interceptor before forwarding to the root terminal mock', async () => {
        vi.useFakeTimers();
        const observed = vi.fn();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(
                    withInterceptors([
                        (req, next) => {
                            observed(req.headers.get('X-Demo-Feature'));
                            return next(req);
                        },
                        mockInterceptor,
                    ]),
                ),
                {
                    provide: DEMO_SESSION,
                    useValue: () => ({
                        identity: DEMO_IDENTITIES[2],
                        epoch: 0,
                    }),
                },
                { provide: REPOSITORY, useValue: new MockRepository() },
            ],
        });
        const child = createEnvironmentInjector(
            [
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
            TestBed.inject(EnvironmentInjector),
        );
        try {
            const result = firstValueFrom(
                child.get(SupplierClient).directory({ q: '', page: 1 }, 'test'),
            );
            await vi.advanceTimersByTimeAsync(250);
            expect((await result).items).toHaveLength(25);
            expect(observed).toHaveBeenCalledWith('suppliers');
        } finally {
            child.destroy();
            vi.useRealTimers();
        }
    });
});
