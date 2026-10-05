import { Injectable, signal } from '@angular/core';
import { DEMO_IDENTITIES } from '../mock-http/seed-data';

@Injectable({ providedIn: 'root' })
export class Session {
  readonly identity = signal(DEMO_IDENTITIES[0]);
  readonly epoch = signal(0);
  select(_personId: string): void { /* Contract stub: implemented in T011. */ }
}
