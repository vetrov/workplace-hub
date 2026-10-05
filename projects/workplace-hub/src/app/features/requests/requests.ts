import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Session } from '../../core/session/session';
import { DatePipe } from '@angular/common';
import { StatusBadge } from 'ui';
import { LIST_KIND, ListQueryState } from '../../core/list-query';
import { INITIAL_DATA } from '../../core/mock-http/seed-data';
import { RequestListService } from './request-list.service';
import { Scenario } from '../../core/scenarios/scenario';

@Component({
    imports: [RouterLink, DatePipe, StatusBadge],
    providers: [
        { provide: LIST_KIND, useValue: 'requests' },
        ListQueryState,
        RequestListService,
    ],
    templateUrl: './requests.html',
})
export class Requests {
    readonly session = inject(Session);
    readonly list = inject(RequestListService);
    readonly query = inject(ListQueryState);
    readonly Math = Math;
    private readonly scenario = inject(Scenario);

    retry(): void {
        this.scenario.retry();
        this.list.retry();
    }

    personName(id: string): string {
        return (
            INITIAL_DATA.people.find((p) => p.id === id)?.name ??
            'Unknown person'
        );
    }

    setSize(value: string): void {
        this.query.update({
            pageSize: Number(value) as 25 | 50 | 100,
            page: 1,
        });
    }
}
