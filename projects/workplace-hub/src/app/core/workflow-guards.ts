import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { DemoRole } from 'domain';
import { Session } from './session/session';
export const roleGuard =
  (...roles: DemoRole[]): CanActivateFn =>
  () =>
    roles.includes(inject(Session).identity().role) ||
    inject(Router).createUrlTree(['/access-denied']);
export interface UnsavedPage {
  canLeave(): boolean;
}
export const requestChangesGuard: CanDeactivateFn<UnsavedPage> = (page) => page.canLeave();
