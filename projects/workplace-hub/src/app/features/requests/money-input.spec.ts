import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    ControlValueAccessor,
    FormControl,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MoneyInput } from 'ui';
import { fieldError } from './request-form';
import * as UI from 'ui';

describe('money value accessor contract', () => {
    it('separates programmatic writes from user edits, propagates touched and disabled state', async () => {
        const component = (
            UI as unknown as { MoneyInput: Type<ControlValueAccessor> }
        ).MoneyInput;
        expect(component).toBeDefined();
        const fixture = TestBed.createComponent(component);
        fixture.componentRef.setInput('fieldId', 'cost-test');
        const accessor = fixture.componentInstance,
            changed = vi.fn(),
            touched = vi.fn();
        accessor.registerOnChange(changed);
        accessor.registerOnTouched(touched);
        accessor.writeValue(12.5);
        await fixture.whenStable();
        const input = fixture.nativeElement.querySelector(
            'input',
        ) as HTMLInputElement;
        expect(input.value).toBe('12.50');
        expect(changed).not.toHaveBeenCalled();
        input.value = '19.95';
        input.dispatchEvent(new Event('input'));
        expect(changed).toHaveBeenLastCalledWith(19.95);
        input.value = '19.999';
        input.dispatchEvent(new Event('input'));
        expect(changed).toHaveBeenLastCalledWith(null);
        input.dispatchEvent(new Event('blur'));
        expect(touched).toHaveBeenCalledOnce();
        accessor.setDisabledState!(true);
        await fixture.whenStable();
        expect(input.disabled).toBe(true);
        accessor.setDisabledState!(false);
        await fixture.whenStable();
        expect(input.disabled).toBe(false);
    });
});

@Component({
    imports: [ReactiveFormsModule, MoneyInput],
    template:
        '<ui-money-input fieldId="integrated-cost" [formControl]="cost" />',
})
class MoneyHost {
    readonly cost = new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0.01),
    ]);
}

describe('money control parent validation', () => {
    it('reports decimal formatting before missing-value feedback and restores valid programmatic values', async () => {
        const fixture = TestBed.createComponent(MoneyHost);
        await fixture.whenStable();
        const control = fixture.componentInstance.cost,
            input = fixture.nativeElement.querySelector(
                'input',
            ) as HTMLInputElement;
        expect(fieldError(control, 'Unit cost')).toBe('Unit cost is required.');
        input.value = '100.999';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        expect(control.errors?.['money']).toBe(true);
        expect(fieldError(control, 'Unit cost')).toBe(
            'Enter a number with at most two decimal places.',
        );
        control.setValue(10.5);
        await fixture.whenStable();
        expect(control.valid).toBe(true);
        expect(input.value).toBe('10.50');
    });
});
