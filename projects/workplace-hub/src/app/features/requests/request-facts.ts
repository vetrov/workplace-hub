import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RequestDetail, requestTotal } from 'domain';
import { StatusBadge } from 'ui';
import { personName } from '../../core/record-labels';

@Component({
  selector: 'app-request-facts',
  imports: [CurrencyPipe, DatePipe, StatusBadge],
  template: `
    <section class="panel detail-section">
      <div class="panel-header">
        <h2>Request details</h2>
        <ui-status [value]="request().status" />
      </div>
      <div class="panel-body">
        <p>{{ request().justification }}</p>
        <dl class="facts">
          <div>
            <dt>Requested by</dt>
            <dd>{{ personName(request().requesterId) }}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{{ request().category }}</dd>
          </div>
          <div>
            <dt>Delivery location</dt>
            <dd>{{ request().delivery.location }}</dd>
          </div>
          <div>
            <dt>Needed by</dt>
            <dd>{{ request().delivery.neededBy | date: 'mediumDate' }}</dd>
          </div>
        </dl>
        <ul class="review-items">
          @for (item of request().items; track $index) {
            <li>
              {{ item.description
              }}<span>{{ item.quantity }} × {{ item.unitCost | currency: 'EUR' }}</span>
            </li>
          }
        </ul>
        <strong>Estimated total: {{ total() | currency: 'EUR' }}</strong>
        <div class="detail-actions"><ng-content /></div>
      </div>
    </section>
    <section class="panel detail-section">
      <div class="panel-header"><h2>Request history</h2></div>
      <ol class="history panel-body">
        @for (event of request().history; track event.id) {
          <li>
            <div>
              <strong>{{ event.action }}</strong
              ><span
                >{{ personName(event.actorId) }} · {{ event.occurredAt | date: 'medium' }}</span
              >
            </div>
            <p>{{ event.note }}</p>
          </li>
        }
      </ol>
    </section>
  `,
})
export class RequestFacts {
  readonly request = input.required<RequestDetail>();
  readonly personName = personName;
  readonly total = computed(() => requestTotal(this.request().items));
}
