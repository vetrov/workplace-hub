import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgComponentOutlet } from '@angular/common';
import { provideRouter } from '@angular/router';
import { DashboardSummary } from 'domain';
import { DASHBOARD_WIDGETS } from './dashboard-widgets';
import { demoContextProviders } from '../../testing/demo-providers';

@Component({
    imports: [NgComponentOutlet],
    template: `
        <ng-container
            [ngComponentOutlet]="widget().component"
            [ngComponentOutletInputs]="inputs()"
        />
    `,
})
class WidgetHost {
    readonly choice = signal(0);
    readonly summary = signal<DashboardSummary>({
        requests: 8,
        pending: 3,
        assets: 17,
        available: 2,
        contextKey: 'demo',
    });
    readonly widget = computed(() => DASHBOARD_WIDGETS[this.choice()]);
    readonly inputs = computed(() => ({
        summary: this.summary(),
        widgetLabel: this.widget().label,
    }));
}

it('switches actual component types and forwards signal inputs plus exposed host-directive labels', async () => {
    TestBed.configureTestingModule({
        providers: [provideRouter([]), ...demoContextProviders()],
    });
    const f = TestBed.createComponent(WidgetHost);
    await f.whenStable();
    let region = f.nativeElement.querySelector('[role=region]') as HTMLElement;
    expect(region.getAttribute('aria-label')).toBe('Pending work');
    expect(region.tabIndex).toBe(0);
    expect(region.textContent).toContain('3 requests awaiting review');
    f.componentInstance.choice.set(1);
    await f.whenStable();
    region = f.nativeElement.querySelector('[role=region]');
    expect(region.getAttribute('aria-label')).toBe('Inventory availability');
    expect(region.textContent).toContain('2 available of 17');
    expect(f.nativeElement.textContent).not.toContain('Pending work');
    f.componentInstance.summary.update((s) => ({ ...s, available: 5 }));
    await f.whenStable();
    expect(region.textContent).toContain('5 available of 17');
});
