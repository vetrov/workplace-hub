import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { mockInterceptor } from './core/mock-http/mock.interceptor';
import { DEMO_SESSION, SCENARIO_CONTEXT } from './core/mock-http/mock-repository';
import { Session } from './core/session/session';
import { Scenario } from './core/scenarios/scenario';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withInterceptors([mockInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    { provide: DEMO_SESSION, useFactory: () => { const session = inject(Session); return () => ({ identity: session.identity(), epoch: session.epoch() }); } },
    { provide: SCENARIO_CONTEXT, useFactory: () => { const scenario = inject(Scenario); return () => ({ mode: scenario.mode(), generation: scenario.generation() }); } }],
};
