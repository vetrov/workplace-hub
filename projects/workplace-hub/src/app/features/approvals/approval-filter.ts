import { Component, model } from '@angular/core';
import { RequestCategory } from 'domain';
export type ApprovalCategory = RequestCategory | 'all';
@Component({
  selector: 'app-approval-filter',
  template: `<div class="field">
    <label for="approval-category">Filter category</label
    ><select
      id="approval-category"
      [value]="category()"
      #filter
      (change)="setCategory(filter.value)"
    >
      <option value="all">All categories</option>
      <option value="equipment">Equipment</option>
      <option value="software">Software</option>
      <option value="service">Service</option>
    </select>
  </div>`,
})
export class ApprovalFilter {
  readonly category = model<ApprovalCategory>('all');
  setCategory(value: string): void {
    if (['all', 'equipment', 'software', 'service'].includes(value))
      this.category.set(value as ApprovalCategory);
  }
}
