import { inject, Provider } from '@angular/core';
import {
    DEMO_SESSION,
    SCENARIO_CONTEXT,
} from '../core/mock-http/mock-repository';
import { Session } from '../core/session/session';
import { Scenario } from '../core/scenarios/scenario';
import { BROWSER_STORAGE } from '../core/storage';

export function demoContextProviders(): Provider[] {
    return [
        { provide: BROWSER_STORAGE, useValue: null },
        {
            provide: DEMO_SESSION,
            useFactory: () => {
                const session = inject(Session);
                return () => ({
                    identity: session.identity(),
                    epoch: session.epoch(),
                });
            },
        },
        {
            provide: SCENARIO_CONTEXT,
            useFactory: () => {
                const scenario = inject(Scenario);
                return () => ({
                    mode: scenario.mode(),
                    generation: scenario.generation(),
                });
            },
        },
    ];
}
