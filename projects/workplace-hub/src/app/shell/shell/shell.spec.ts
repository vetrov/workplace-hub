import {
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { DemoContext } from '../../core/mock-http/context';
import { demoContextProviders } from '../../testing/demo-providers';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BROWSER_STORAGE } from '../../core/storage';
import { Shell } from './shell';

describe('saved demo identity in navigation', () => {
    it('shows the saved identity rather than the first dynamically rendered option', async () => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                ...demoContextProviders(),
                provideHttpClient(
                    withInterceptors([
                        () =>
                            of(
                                new HttpResponse({
                                    body: {
                                        record: {
                                            organizationName: 'Workplace Hub',
                                            defaultReportDataset: 'requests',
                                            managerCanCreateReports: true,
                                            managerCanExportReports: true,
                                            categories: [],
                                        },
                                        contextKey: inject(DemoContext).key(),
                                    },
                                }),
                            ),
                    ]),
                ),
                {
                    provide: BROWSER_STORAGE,
                    useValue: {
                        getItem: (key: string) =>
                            key === 'workplace-hub.identity.v1' ? 'P013' : null,
                        setItem: () => {},
                    },
                },
            ],
        });
        const fixture = TestBed.createComponent(Shell);
        await fixture.whenStable();
        const select = fixture.nativeElement.querySelector(
            '#demo-identity',
        ) as HTMLSelectElement;
        expect(select.value).toBe('P013');
        expect(select.selectedOptions[0].textContent).toContain(
            'Administrator',
        );
    });
});
