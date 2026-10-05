import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-status',
  template: '<span class="status-badge" [attr.data-status]="value()">{{ value() }}</span>',
})
export class StatusBadge { readonly value = input.required<string>(); }
