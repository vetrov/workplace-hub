import { Directive, input } from '@angular/core';

@Directive({
    selector: '[uiWidgetSurface]',
    host: {
        role: 'region',
        tabindex: '0',
        class: 'widget-surface',
        '[attr.aria-label]': 'surfaceLabel()',
    },
})
export class WidgetSurface {
    readonly surfaceLabel = input('Dashboard widget');
}
