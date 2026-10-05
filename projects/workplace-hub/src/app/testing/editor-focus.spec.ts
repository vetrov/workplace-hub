import { inject, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    HttpResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DemoContext } from '../core/mock-http/context';
import { MockRepository } from '../core/mock-http/mock-repository';
import { Session } from '../core/session/session';
import { Scenario } from '../core/scenarios/scenario';
import { RequestWizard } from '../features/requests/request-wizard';
import { AssetCreate } from '../features/assets/asset-create';
import { demoContextProviders } from './demo-providers';

async function render<T>(component: Type<T>, actor: string) {
    const repo = new MockRepository();
    TestBed.configureTestingModule({
        imports: [component],
        providers: [
            ...demoContextProviders(),
            provideRouter([]),
            provideHttpClient(
                withInterceptors([
                    (request) =>
                        of(
                            new HttpResponse({
                                body:
                                    request.url === '/api/organization'
                                        ? {
                                              record: repo.organization(
                                                  inject(Session).identity(),
                                              ),
                                              contextKey:
                                                  inject(DemoContext).key(),
                                          }
                                        : {
                                              items: [
                                                  {
                                                      id: 'S001',
                                                      name: 'Northstar',
                                                  },
                                              ],
                                              contextKey:
                                                  inject(DemoContext).key(),
                                          },
                            }),
                        ),
                ]),
            ),
        ],
    });
    TestBed.inject(Session).select(actor);
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
}

it('focuses wizard step fields, the native invalid money input, review and back; invalid review save returns to details', async () => {
    const f = await render(RequestWizard, 'P025'),
        page = f.componentInstance;
    page.next();
    await f.whenStable();
    expect(document.activeElement?.id).toBe('request-title');
    page.form.patchValue({
        title: 'Keyboard request',
        justification: 'A replacement for daily development.',
        delivery: { location: 'Helsinki', neededBy: '2026-12-01' },
    });
    page.next();
    await f.whenStable();
    expect(document.activeElement?.id).toBe('item-description-0');
    page.form.controls.items.at(0).controls.description.setValue('Computer');
    const cost = f.nativeElement.querySelector(
        '#item-cost-0',
    ) as HTMLInputElement;
    cost.value = '100.999';
    cost.dispatchEvent(new Event('input', { bubbles: true }));
    page.next();
    await f.whenStable();
    expect(document.activeElement).toBe(cost);
    expect(page.step()).toBe(2);
    cost.value = '125.50';
    cost.dispatchEvent(new Event('input', { bubbles: true }));
    page.next();
    await f.whenStable();
    expect(document.activeElement?.id).toBe('request-review');
    page.back();
    await f.whenStable();
    expect(document.activeElement?.id).toBe('item-description-0');
    page.next();
    await f.whenStable();
    page.form.controls.title.setValue('');
    page.save('submitted');
    await f.whenStable();
    expect(page.step()).toBe(1);
    expect(document.activeElement?.id).toBe('request-title');
});

it('does not apply obsolete wizard focus after a context reset or identity change', async () => {
    const f = await render(RequestWizard, 'P025'),
        page = f.componentInstance;
    page.form.patchValue({
        title: 'Keyboard request',
        justification: 'A replacement for daily development.',
        delivery: { location: 'Helsinki', neededBy: '2026-12-01' },
    });
    page.next();
    TestBed.inject(Scenario).reset();
    await f.whenStable();
    expect(page.step()).toBe(1);
    expect(document.activeElement?.id).not.toBe('item-description-0');
    page.next();
    TestBed.inject(Session).select('P001');
    await f.whenStable();
    expect(f.nativeElement.querySelector('form')).toBeNull();
    expect(document.activeElement?.id).not.toBe('request-title');
});

it('focuses actual asset invalid fields and unavailable supplier recovery without stale role focus', async () => {
    const f = await render(AssetCreate, 'P013'),
        page = f.componentInstance;
    page.save();
    await f.whenStable();
    expect(document.activeElement?.id).toBe('asset-name');
    page.form.controls.name.setValue('Keyboard computer');
    page.save();
    await f.whenStable();
    expect(document.activeElement?.id).toBe('asset-serial');
    page.form.controls.serialNumber.setValue('KEY-001');
    page.form.controls.supplierId.setValue('missing');
    page.save();
    await f.whenStable();
    expect(page.supplierError()).toContain('available supplier');
    expect(document.activeElement?.id).toBe('asset-supplier');
    page.form.controls.name.setValue('');
    page.save();
    TestBed.inject(Session).select('P025');
    await f.whenStable();
    expect(f.nativeElement.querySelector('form')).toBeNull();
    expect(document.activeElement?.id).not.toBe('asset-name');
});
