import { FormArray } from '@angular/forms';
import { requestTotal } from 'domain';
import { createRequestForm, createRequestLine } from './request-form';

describe('typed request form validation', () => {
  const valid = {
    title: 'Office laptop',
    justification: 'Replacement for daily development work.',
    category: 'equipment',
    delivery: { location: 'Helsinki', neededBy: '2026-12-01' },
    items: [{ description: 'Laptop computer', quantity: 2, unitCost: 10.25 }],
  };
  it('validates nested delivery, integer quantities and decimal money', () => {
    const form = createRequestForm();
    expect(form.valid).toBe(false);
    form.setValue(valid);
    expect(form.valid).toBe(true);
    form.get('delivery.neededBy')!.setValue('2026-02-30');
    expect(form.valid).toBe(false);
    form.get('delivery.neededBy')!.setValue('2026-12-01');
    form.get('items.0.quantity')!.setValue(1.5);
    expect(form.valid).toBe(false);
    form.get('items.0.quantity')!.setValue(2);
    form.get('items.0.unitCost')!.setValue(1.001);
    expect(form.valid).toBe(false);
  });
  it('requires one to ten rows and rejects whitespace-only descriptions', () => {
    const form = createRequestForm();
    form.setValue(valid);
    const rows = form.get('items') as FormArray;
    rows.at(0).get('description')!.setValue('   ');
    expect(form.valid).toBe(false);
    rows.clear();
    expect(form.valid).toBe(false);
    for (let i = 0; i < 11; i++) {
      const row = createRequestLine();
      row.setValue(valid.items[0]);
      rows.push(row);
    }
    expect(rows.valid).toBe(false);
  });
  it('computes totals with integer cents rather than binary decimal sums', () => {
    expect(
      requestTotal([
        { description: 'Test item', quantity: 3, unitCost: 0.1 },
        { description: 'Other item', quantity: 1, unitCost: 0.2 },
      ]),
    ).toBe(0.5);
  });
});
