import {
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { AfterViewInit, Component, inject } from '@angular/core';
import { of } from 'rxjs';
import { DemoContext } from '../../core/mock-http/context';
import { demoContextProviders } from '../../testing/demo-providers';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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

@Component({
    template:
        '<h1>First page</h1><input id="route-search" aria-label="Search records" />',
})
class FirstPage {}

@Component({
    template:
        '<h1>Second page</h1><a id="route-action" href="#main">Page action</a>',
})
class SecondPage {}

@Component({
    template:
        '<h1>Focused editor</h1><input id="editor-autofocus" aria-label="Editor name" />',
})
class FocusedEditor implements AfterViewInit {
    ngAfterViewInit(): void {
        document.querySelector<HTMLInputElement>('#editor-autofocus')?.focus();
    }
}

async function renderNavigationShell() {
    TestBed.configureTestingModule({
        providers: [
            ...demoContextProviders(),
            provideRouter([
                { path: 'first', component: FirstPage },
                {
                    path: 'second/:id',
                    component: SecondPage,
                    canDeactivate: [
                        (_component, _route, _current, next) =>
                            next.url !== '/first',
                    ],
                },
                { path: 'editor', component: FocusedEditor },
            ]),
            provideHttpClient(
                withInterceptors([
                    () =>
                        of(
                            new HttpResponse({
                                body: {
                                    record: {
                                        organizationName: 'Workplace Hub',
                                        categories: [],
                                    },
                                    contextKey: inject(DemoContext).key(),
                                },
                            }),
                        ),
                ]),
            ),
        ],
    });
    const fixture = TestBed.createComponent(Shell),
        router = TestBed.inject(Router);
    await router.navigateByUrl('/first');
    await fixture.whenStable();
    return { fixture, router };
}

it('focuses completed page changes and reused records while preserving initial/query/fragment and denied-navigation focus', async () => {
    const { fixture, router } = await renderNavigationShell();
    expect(document.activeElement?.textContent).not.toBe('First page');
    const search = fixture.nativeElement.querySelector(
        '#route-search',
    ) as HTMLInputElement;
    search.focus();
    await router.navigateByUrl('/first?q=alex');
    await fixture.whenStable();
    expect(document.activeElement).toBe(search);
    await router.navigateByUrl('/first?q=alex#results');
    await fixture.whenStable();
    expect(document.activeElement).toBe(search);
    await router.navigateByUrl('/second/one');
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toBe('Second page');
    expect(document.activeElement?.getAttribute('tabindex')).toBe('-1');
    const action = fixture.nativeElement.querySelector(
        '#route-action',
    ) as HTMLElement;
    action.focus();
    expect(await router.navigateByUrl('/first')).toBe(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(action);
    expect(await router.navigateByUrl('/second/two')).toBe(true);
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toBe('Second page');
});

it('preserves incoming feature initial-field focus instead of replacing it with heading focus', async () => {
    const { fixture, router } = await renderNavigationShell();
    await router.navigateByUrl('/editor');
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('editor-autofocus');
});
