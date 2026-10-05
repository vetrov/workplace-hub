import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ControlValueAccessor } from '@angular/forms';
import * as UI from 'ui';

describe('money value accessor contract', () => {
  it('separates programmatic writes from user edits, propagates touched and disabled state', async () => {
    const component = (UI as unknown as { MoneyInput: Type<ControlValueAccessor> }).MoneyInput;
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
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
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
