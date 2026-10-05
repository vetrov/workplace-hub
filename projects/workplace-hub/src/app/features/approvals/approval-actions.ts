import {
    booleanAttribute,
    Component,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import { RequestDetail } from 'domain';

@Component({
    selector: 'app-approval-actions',
    template: `
        <section class="panel detail-section">
            <div class="panel-header"><h2>Review decision</h2></div>
            <div class="panel-body">
                <fieldset [disabled]="busy()">
                    <legend class="sr-only">
                        Decide request {{ request().id }}
                    </legend>
                    <div class="field">
                        <label for="decision-reason">Decision reason</label>
                        <textarea
                            id="decision-reason"
                            aria-describedby="reason-hint"
                            [value]="reason()"
                            #text
                            (input)="reason.set(text.value)"
                            rows="3"
                            maxlength="500"
                        ></textarea>
                        <small id="reason-hint">
                            A reason of at least 3 characters is required for
                            rejection; optional for approval.
                        </small>
                    </div>
                    @if (error()) {
                        <p
                            class="field-error"
                            role="alert"
                        >
                            {{ error() }}
                        </p>
                    }
                    <div class="detail-actions">
                        <button
                            class="primary"
                            (click)="send('approve')"
                        >
                            {{
                                busy() ? 'Saving decision…' : 'Approve request'
                            }}
                        </button>
                        <button
                            class="danger"
                            (click)="send('reject')"
                        >
                            Reject request
                        </button>
                    </div>
                </fieldset>
            </div>
        </section>
    `,
})
export class ApprovalActions {
    readonly request = input.required<RequestDetail>();
    readonly busy = input(false, { transform: booleanAttribute });
    readonly decision = output<{
        decision: 'approve' | 'reject';
        reason: string;
    }>();
    readonly reason = signal('');
    readonly error = signal('');

    constructor() {
        effect(() => {
            this.request().id;
            this.reason.set('');
            this.error.set('');
        });
    }

    send(decision: 'approve' | 'reject'): void {
        if (this.busy()) return;
        const reason = this.reason().trim();
        if (
            (decision === 'reject' && reason.length < 3) ||
            reason.length > 500
        ) {
            this.error.set(
                'Add a reason of 3–500 characters before rejecting.',
            );
            return;
        }
        this.error.set('');
        this.decision.emit({ decision, reason });
    }
}
