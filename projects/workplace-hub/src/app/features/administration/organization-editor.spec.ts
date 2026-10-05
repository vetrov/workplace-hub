import {
    HttpErrorResponse,
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { WorkflowError } from 'domain';
import { OrganizationEditor, OrganizationSection } from './organization-editor';
import {
    MockRepository,
    REPOSITORY,
} from '../../core/mock-http/mock-repository';
import { DemoContext } from '../../core/mock-http/context';
import { Session } from '../../core/session/session';
import { demoContextProviders } from '../../testing/demo-providers';

async function editor(section: OrganizationSection, failFirst = false) {
    const repo = new MockRepository();
    let writes = 0;
    TestBed.configureTestingModule({
        imports: [OrganizationEditor],
        providers: [
            provideRouter([]),
            ...demoContextProviders(),
            { provide: REPOSITORY, useValue: repo },
            provideHttpClient(
                withInterceptors([
                    (request) => {
                        const key = inject(DemoContext).key(),
                            actor = inject(Session).identity();
                        if (request.method === 'PATCH') {
                            writes++;
                            if (failFirst && writes === 1)
                                return throwError(
                                    () =>
                                        new HttpErrorResponse({
                                            status: 503,
                                            error: {
                                                message:
                                                    'Temporary configuration failure.',
                                            },
                                        }),
                                );
                        }
                        try {
                            if (
                                request.url === '/api/config/categories' &&
                                request.method === 'GET'
                            )
                                return of(
                                    new HttpResponse({
                                        body: {
                                            items: repo.categories(actor),
                                            contextKey: key,
                                        },
                                    }),
                                );
                            const record =
                                request.url === '/api/config/roles'
                                    ? request.method === 'PATCH'
                                        ? repo.updateRoles(request.body, actor)
                                        : repo.roles(actor)
                                    : request.url === '/api/config/settings'
                                      ? request.method === 'PATCH'
                                          ? repo.updateSettings(
                                                request.body,
                                                actor,
                                            )
                                          : repo.settings(actor)
                                      : repo.updateCategory(
                                            request.url.split('/').at(-1)!,
                                            request.body,
                                            actor,
                                        );
                            return of(
                                new HttpResponse({
                                    body: { record, contextKey: key },
                                }),
                            );
                        } catch (error) {
                            const failure = error as WorkflowError;
                            return throwError(
                                () =>
                                    new HttpErrorResponse({
                                        status: failure.status,
                                        error: { message: failure.message },
                                    }),
                            );
                        }
                    },
                ]),
            ),
        ],
    });
    const session = TestBed.inject(Session);
    session.select('P013');
    const f = TestBed.createComponent(OrganizationEditor);
    f.componentRef.setInput('section', section);
    await f.whenStable();
    return { f, repo, session, writes: () => writes };
}

describe('versioned organization configuration forms', () => {
    afterEach(() => vi.restoreAllMocks());

    it('validates settings, retains failed values and retries without overwriting version', async () => {
        const { f, repo, session, writes } = await editor('settings', true),
            page = f.componentInstance;
        expect(page.settingsForm.pristine).toBe(true);
        page.settingsForm.controls.organizationName.setValue('  ');
        page.settingsForm.markAsDirty();
        page.saveSettings();
        await f.whenStable();
        expect(writes()).toBe(0);
        expect(document.activeElement?.id).toBe('organization-name');
        page.settingsForm.controls.organizationName.setValue(
            'Nordic Operations',
        );
        page.settingsForm.controls.defaultReportDataset.setValue('assets');
        page.saveSettings();
        await f.whenStable();
        expect(page.mutation.error()).toBe('Temporary configuration failure.');
        expect(page.settingsForm.dirty).toBe(true);
        expect(page.settingsEditor.loaded()?.version).toBe(1);
        page.saveSettings();
        await f.whenStable();
        expect(writes()).toBe(2);
        expect(page.settingsEditor.loaded()?.version).toBe(2);
        expect(page.settingsForm.pristine).toBe(true);
        expect(repo.organization(session.identity())).toMatchObject({
            organizationName: 'Nordic Operations',
            defaultReportDataset: 'assets',
        });
    });

    it('protects dirty category switching and reports uniqueness conflicts while retaining inputs', async () => {
        const { f } = await editor('categories'),
            page = f.componentInstance;
        page.categoryForm.controls.label.setValue('Unsaved hardware');
        page.categoryForm.markAsDirty();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        page.chooseCategory('software');
        await f.whenStable();
        expect(page.selectedCategory()).toBe('equipment');
        expect(page.categoryForm.controls.label.value).toBe('Unsaved hardware');
        confirm.mockReturnValue(true);
        page.chooseCategory('software');
        await f.whenStable();
        expect(page.categoryForm.controls.label.value).toBe('Software');
        page.categoryForm.controls.label.setValue('Equipment');
        page.categoryForm.markAsDirty();
        page.saveCategory();
        await f.whenStable();
        expect(page.mutation.error()).toBe('Category labels must be unique.');
        expect(page.categoryForm.controls.label.value).toBe('Equipment');
        expect(page.categoryForm.dirty).toBe(true);
        page.categoryForm.controls.label.setValue('Apps');
        page.saveCategory();
        await f.whenStable();
        expect(page.categoryEditor.loaded()?.version).toBe(2);
        expect(page.categoryForm.pristine).toBe(true);
    });

    it('saves manager capabilities and clears loaded configuration on identity changes', async () => {
        const { f, repo, session } = await editor('roles'),
            page = f.componentInstance;
        page.roleForm.controls.managerCanCreateReports.setValue(false);
        page.roleForm.controls.managerCanExportReports.setValue(false);
        page.saveRoles();
        await f.whenStable();
        expect(repo.organization(session.identity())).toMatchObject({
            managerCanCreateReports: false,
            managerCanExportReports: false,
        });
        session.select('P025');
        expect(page.administrator()).toBe(false);
        await f.whenStable();
        expect(page.roleEditor.loaded()).toBeUndefined();
        expect(f.nativeElement.querySelector('form')).toBeNull();
    });
});
