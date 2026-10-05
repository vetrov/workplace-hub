import { inject, Injectable, signal } from '@angular/core';
import { ScenarioMode } from 'domain';
import { REPOSITORY } from '../mock-http/mock-repository';

@Injectable({ providedIn: 'root' })
export class Scenario {
  private readonly repository = inject(REPOSITORY);
  private readonly selectedMode = signal<ScenarioMode>('normal');
  private readonly version = signal(0);
  private readonly resets = signal(0);
  readonly mode = this.selectedMode.asReadonly();
  readonly generation = this.version.asReadonly();
  readonly resetVersion = this.resets.asReadonly();
  select(mode: ScenarioMode): void {
    if (!['normal', 'empty', 'delayed', 'error'].includes(mode) || mode === this.mode()) return;
    this.selectedMode.set(mode);
    this.version.update((value) => value + 1);
  }
  reset(): void {
    this.repository.reset();
    this.selectedMode.set('normal');
    this.version.update((value) => value + 1);
    this.resets.update((value) => value + 1);
  }
  retry(): void {
    this.selectedMode.set('normal');
    this.version.update((value) => value + 1);
  }
}
