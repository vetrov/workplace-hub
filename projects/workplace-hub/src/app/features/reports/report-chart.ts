import { Component, input } from '@angular/core';
import { ReportBucket } from 'domain';
import { DisplayLabel } from 'ui';

@Component({
    selector: 'app-report-chart',
    imports: [DisplayLabel],
    template: `
        <section
            class="panel detail-section"
            aria-labelledby="chart-heading"
        >
            <div class="panel-header">
                <h2 id="chart-heading">Records by status</h2>
            </div>
            <div class="panel-body">
                @for (bucket of buckets(); track bucket.label) {
                    <div class="chart-row">
                        <div class="chart-label">
                            <strong>{{ bucket.label | displayLabel }}</strong>
                            <span>{{ bucket.count }} records</span>
                        </div>
                        <div
                            class="chart-track"
                            aria-hidden="true"
                        >
                            <div
                                class="chart-bar"
                                [style.width.%]="percentage(bucket.count)"
                            ></div>
                        </div>
                    </div>
                }
                @if (!buckets().length) {
                    <p>
                        No records to visualize. The report filters have no
                        matches.
                    </p>
                }
                <p class="muted">
                    {{ total() }} matching records. Exact counts are also
                    available in the table and CSV.
                </p>
            </div>
        </section>
    `,
})
export class ReportChart {
    readonly buckets = input.required<readonly ReportBucket[]>();
    readonly total = input.required<number>();

    percentage(count: number): number {
        return this.total() ? Math.round((count / this.total()) * 100) : 0;
    }
}
