import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'displayLabel' })
export class DisplayLabel implements PipeTransform {
    transform(value: string | null | undefined): string {
        return value
            ? value
                  .replaceAll('_', ' ')
                  .replaceAll('-', ' ')
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())
            : '—';
    }
}
