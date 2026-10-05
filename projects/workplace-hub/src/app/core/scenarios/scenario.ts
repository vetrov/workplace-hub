import { Injectable, signal } from '@angular/core';
import { ScenarioMode } from 'domain';

@Injectable({ providedIn: 'root' })
export class Scenario {
  readonly mode = signal<ScenarioMode>('normal');
  readonly generation = signal(0);
  readonly resetVersion = signal(0);
  select(_mode: ScenarioMode): void { /* Implemented in T016. */ }
  reset(): void { /* Implemented in T016. */ }
  retry(): void { /* Implemented in T016. */ }
}
