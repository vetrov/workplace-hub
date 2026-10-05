import {
    Directive,
    effect,
    inject,
    input,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { DemoRole } from 'domain';
import { Session } from './session/session';

@Directive({ selector: '[appRoleOnly]' })
export class RoleOnly {
    readonly appRoleOnly = input.required<DemoRole | readonly DemoRole[]>();
    private readonly session = inject(Session);
    private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
    private readonly container = inject(ViewContainerRef);
    private rendered = false;

    constructor() {
        effect(() => {
            const roles = this.appRoleOnly(),
                allowed = (
                    typeof roles === 'string' ? [roles] : roles
                ).includes(this.session.identity().role);
            if (allowed && !this.rendered) {
                this.container.createEmbeddedView(this.template);
                this.rendered = true;
            } else if (!allowed && this.rendered) {
                this.container.clear();
                this.rendered = false;
            }
        });
    }
}
