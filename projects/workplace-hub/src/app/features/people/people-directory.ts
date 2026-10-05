import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Person } from 'domain';
import { directoryRead } from '../../core/directory-read';

@Component({
    imports: [RouterLink],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">People</p>
                <h1>People directory</h1>
                <p>Find colleagues across the organization.</p>
            </div>
        </div>
        <form
            class="toolbar"
            (submit)="$event.preventDefault(); reader.search(search.value)"
        >
            <label for="people-search">Search colleagues</label>
            <input
                id="people-search"
                #search
                [value]="reader.query().q"
                placeholder="Name, email or ID"
            />
            <button type="submit">Search</button>
        </form>
        @if (reader.loading()) {
            <p role="status">Loading people…</p>
        }
        @if (reader.error()) {
            <div
                class="notice"
                role="alert"
            >
                {{ reader.error() }}
                <button (click)="reader.retry()">Retry people</button>
            </div>
        }
        @if (reader.result(); as result) {
            <section class="panel">
                <div class="panel-header">
                    <h2>{{ result.total }} colleagues</h2>
                    <span>Page {{ result.page }}</span>
                </div>
                @if (result.items.length) {
                    <div class="table-wrap">
                        <table>
                            <caption class="sr-only">People directory</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Colleague</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Team</th>
                                </tr>
                            </thead>
                            <tbody>
                                @for (person of result.items; track person.id) {
                                    <tr>
                                        <td>
                                            <a
                                                [routerLink]="[
                                                    '/people',
                                                    person.id,
                                                ]"
                                            >
                                                {{ person.name }}
                                            </a>
                                            <small>{{ person.id }}</small>
                                        </td>
                                        <td>{{ person.email }}</td>
                                        <td>{{ person.teamId }}</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                } @else {
                    <div class="state">
                        <h2>No colleagues found</h2>
                        <p>Try another name or reset the demo.</p>
                    </div>
                }
                <div class="pagination">
                    <button
                        [disabled]="result.page <= 1"
                        (click)="reader.page(result.page - 1)"
                    >
                        Previous
                    </button>
                    <span>{{ result.total }} results</span>
                    <button
                        [disabled]="result.page * 25 >= result.total"
                        (click)="reader.page(result.page + 1)"
                    >
                        Next
                    </button>
                </div>
            </section>
        }
    `,
})
export class PeopleDirectory {
    readonly reader = directoryRead<Person>('/api/people');
}
