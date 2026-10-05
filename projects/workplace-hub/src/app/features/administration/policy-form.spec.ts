import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, submit } from '@angular/forms/signals';
import { CategoryPicker } from 'ui';
import { createPolicyForm, PolicyDraft } from './policy-form';

@Component({
    imports: [FormField, CategoryPicker],
    template: `
        <input
            id="test-name"
            [formField]="policyForm.name"
        />
        <ui-category-picker
            fieldId="test-category"
            label="Category"
            [options]="options"
            [formField]="policyForm.category"
        />
    `,
})
class PolicyHost {
    readonly busy = signal(false);
    readonly model = signal<PolicyDraft>({
        name: 'Equipment policy',
        category: '',
        maximumTotal: 100,
        enabled: true,
        notes: '',
    });
    readonly policyForm = createPolicyForm(this.model, this.busy);
    readonly options = [
        { value: 'equipment', label: 'Equipment' },
        { value: 'software', label: 'Software' },
    ];
}

describe('actual Signal Forms policy schema and custom control', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [PolicyHost] }));

    it('propagates native picker edits, touched/dirty, reset and disabled state through FormField', async () => {
        const fixture = TestBed.createComponent(PolicyHost);
        await fixture.whenStable();
        const host = fixture.componentInstance,
            select = fixture.nativeElement.querySelector('select');
        expect(host.policyForm.category().invalid()).toBe(true);
        select.value = 'equipment';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('blur'));
        await fixture.whenStable();
        expect(host.model().category).toBe('equipment');
        expect(host.policyForm.category().touched()).toBe(true);
        expect(host.policyForm().dirty()).toBe(true);
        expect(host.policyForm().valid()).toBe(true);
        host.policyForm.category().focusBoundControl();
        expect(document.activeElement?.id).toBe('test-category');
        host.busy.set(true);
        await fixture.whenStable();
        expect(select.disabled).toBe(true);
        host.busy.set(false);
        host.policyForm().reset({ ...host.model(), category: 'software' });
        await fixture.whenStable();
        expect(select.value).toBe('software');
        expect(host.policyForm().dirty()).toBe(false);
        expect(host.policyForm.category().touched()).toBe(false);
    });

    it('rejects whitespace names, unsupported categories and non-cent totals before action', async () => {
        const fixture = TestBed.createComponent(PolicyHost);
        await fixture.whenStable();
        const host = fixture.componentInstance;
        host.model.set({
            name: '   ',
            category: 'unsupported',
            maximumTotal: 1.001,
            enabled: true,
            notes: '',
        });
        const action = vi.fn(async () => undefined);
        await submit(host.policyForm, { ignoreValidators: 'none', action });
        expect(action).not.toHaveBeenCalled();
        expect(host.policyForm().errorSummary().length).toBeGreaterThanOrEqual(
            3,
        );
        expect(host.policyForm.name().touched()).toBe(true);
    });

    it('tracks submission and prevents a second action until the first completes', async () => {
        const fixture = TestBed.createComponent(PolicyHost);
        await fixture.whenStable();
        const host = fixture.componentInstance;
        host.model.update((value) => ({ ...value, category: 'equipment' }));
        let finish!: () => void;
        const pending = new Promise<void>((resolve) => (finish = resolve));
        const action = vi.fn(async () => {
            await pending;
            return undefined;
        });
        const first = submit(host.policyForm, {
            ignoreValidators: 'none',
            action,
        });
        await Promise.resolve();
        expect(host.policyForm().submitting()).toBe(true);
        await submit(host.policyForm, { ignoreValidators: 'none', action });
        expect(action).toHaveBeenCalledOnce();
        finish();
        await first;
        expect(host.policyForm().submitting()).toBe(false);
    });
});
