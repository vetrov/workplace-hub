import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { canEditRequest, canReviewRequest, RequestDetail } from 'domain';
import { Session } from '../../core/session/session';
import { recordResource } from '../../core/workflow-read';
import { RequestFacts } from './request-facts';

@Component({ imports: [RouterLink, RequestFacts], templateUrl: './request-detail.html' })
export class RequestDetailPage {
  readonly id = input.required<string>();
  readonly session = inject(Session);
  readonly reader = recordResource<RequestDetail>(
    () => `/api/requests/${encodeURIComponent(this.id())}`,
  );
  readonly editable = computed(
    () => !!this.reader.record() && canEditRequest(this.reader.record()!, this.session.identity()),
  );
  readonly reviewable = computed(
    () =>
      !!this.reader.record() && canReviewRequest(this.reader.record()!, this.session.identity()),
  );
}
