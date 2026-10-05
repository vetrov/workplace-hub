import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StatusBadge } from 'ui';
import { LIST_KIND, ListQueryState } from '../../core/list-query';
import { INITIAL_DATA } from '../../core/mock-http/seed-data';
import { RequestListService } from './request-list.service';

@Component({ imports: [DatePipe, StatusBadge], providers: [{ provide: LIST_KIND, useValue: 'requests' }, ListQueryState, RequestListService], templateUrl: './requests.html' })
export class Requests {
  readonly list = inject(RequestListService);
  readonly query = inject(ListQueryState);
  readonly Math = Math;
  personName(id: string): string { return INITIAL_DATA.people.find(p => p.id === id)?.name ?? 'Unknown person'; }
  setSize(value: string): void { this.query.update({ pageSize: Number(value) as 25 | 50 | 100, page: 1 }); }
}
