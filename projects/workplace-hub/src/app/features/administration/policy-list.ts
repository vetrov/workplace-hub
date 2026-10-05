import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CollectionResult, PurchasingPolicy } from 'domain';
import { Session } from '../../core/session/session';
import { DemoContext, responseError } from '../../core/mock-http/context';
import { Scenario } from '../../core/scenarios/scenario';

@Component({
    imports: [RouterLink, CurrencyPipe],
    template: `
        <div class="page-header">
            <div>
                <p class="eyebrow">Administration</p>
                <h1>Purchasing policies</h1>
                <p>Category limits apply to future submitted requests.</p>
            </div>
        </div>
        @if (!administrator()) {
            <section class="panel state">
                <h2>Administrator identity required</h2>
            </section>
        } @else {
            <section class="panel detail-section">
                @if (resource.isLoading()) {
                    <p role="status">Loading policies…</p>
                } @else if (error()) {
                    <div
                        class="state"
                        role="alert"
                    >
                        <p>{{ error() }}</p>
                        <button (click)="retry()">Retry policies</button>
                    </div>
                } @else if (!policies().length) {
                    <div class="state">
                        <h2>No policies found</h2>
                        <p>Reset the demo to restore purchasing policies.</p>
                    </div>
                } @else {
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Policy</th>
                                    <th>Category</th>
                                    <th>Maximum total</th>
                                    <th>State</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @for (policy of policies(); track policy.id) {
                                    <tr>
                                        <td>{{ policy.name }}</td>
                                        <td>{{ policy.category }}</td>
                                        <td>
                                            {{
                                                policy.maximumTotal
                                                    | currency: 'EUR'
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                policy.enabled
                                                    ? 'Enabled'
                                                    : 'Disabled'
                                            }}
                                        </td>
                                        <td>
                                            <a
                                                [routerLink]="[
                                                    '/administration/policies',
                                                    policy.id,
                                                    'edit',
                                                ]"
                                            >
                                                Edit {{ policy.name }}
                                            </a>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                }
            </section>
        }
    `,
})
export class PolicyList {
    private readonly session = inject(Session);
    private readonly context = inject(DemoContext);
    private readonly scenario = inject(Scenario);
    readonly administrator = computed(
        () => this.session.identity().role === 'administrator',
    );
    readonly resource = httpResource<CollectionResult<PurchasingPolicy>>(() =>
        this.administrator()
            ? { url: '/api/policies', params: { context: this.context.key() } }
            : undefined,
    );
    readonly policies = computed(() =>
        this.resource.hasValue() &&
        !this.resource.isLoading() &&
        this.resource.value().contextKey === this.context.key()
            ? this.resource.value().items
            : [],
    );
    readonly error = computed(() =>
        this.resource.error() ? responseError(this.resource.error()) : '',
    );

    retry(): void {
        this.scenario.retry();
        this.resource.reload();
    }
}
