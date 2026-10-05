import { Component, forwardRef, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Component({
  selector: 'ui-money-input',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoneyInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => MoneyInput), multi: true },
  ],
  template: `<input
    [id]="fieldId()"
    [attr.aria-label]="label()"
    inputmode="decimal"
    type="text"
    [value]="raw()"
    [disabled]="disabled()"
    [attr.aria-invalid]="validate() ? 'true' : null"
    #amount
    (input)="edit(amount.value)"
    (blur)="touch()"
  />`,
})
export class MoneyInput implements ControlValueAccessor, Validator {
  readonly fieldId = input.required<string>();
  readonly label = input('Unit cost (€)');
  readonly raw = signal('');
  readonly disabled = signal(false);
  private changed: (value: number | null) => void = () => {};
  private touched: () => void = () => {};
  private validationChanged: () => void = () => {};
  writeValue(value: number | null): void {
    this.raw.set(value == null ? '' : Number.isFinite(value) ? value.toFixed(2) : String(value));
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.changed = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  registerOnValidatorChange(fn: () => void): void {
    this.validationChanged = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
  validate(): ValidationErrors | null {
    return this.raw() !== '' && !/^-?\d+(\.\d{1,2})?$/.test(this.raw()) ? { money: true } : null;
  }
  edit(value: string): void {
    if (this.disabled()) return;
    this.raw.set(value);
    this.changed(value.trim() === '' || this.validate() ? null : Number(value));
    this.validationChanged();
  }
  touch(): void {
    this.touched();
  }
}
