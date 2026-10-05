import { computed, inject, Injectable, signal } from '@angular/core';
import { DemoIdentity } from 'domain';
import { DEMO_IDENTITIES, INITIAL_DATA } from '../mock-http/seed-data';
import { BROWSER_STORAGE } from '../storage';

@Injectable({ providedIn: 'root' })
export class Session {
    private readonly storage = inject(BROWSER_STORAGE);
    private readonly selected = signal<DemoIdentity>(DEMO_IDENTITIES[0]);
    private readonly version = signal(0);
    readonly identity = this.selected.asReadonly();
    readonly epoch = this.version.asReadonly();
    readonly identities = DEMO_IDENTITIES;
    readonly personName = computed(
        () =>
            INITIAL_DATA.people.find((p) => p.id === this.identity().personId)
                ?.name ?? 'Demo user',
    );

    readonly initials = computed(() =>
        this.personName()
            .split(' ')
            .map((p) => p[0])
            .join(''),
    );

    constructor() {
        try {
            const id = this.storage?.getItem('workplace-hub.identity.v1');
            this.selected.set(
                DEMO_IDENTITIES.find((i) => i.personId === id) ??
                    DEMO_IDENTITIES[0],
            );
        } catch {
            /* Use a session-only identity. */
        }
    }

    select(personId: string): void {
        const identity = DEMO_IDENTITIES.find((i) => i.personId === personId);
        if (!identity || identity.personId === this.identity().personId) return;
        this.selected.set(identity);
        this.version.update((value) => value + 1);
        try {
            this.storage?.setItem(
                'workplace-hub.identity.v1',
                identity.personId,
            );
        } catch {
            /* Selection remains usable for this session. */
        }
    }
}
