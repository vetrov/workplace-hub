import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DemoRole } from 'domain';
import { RoleOnly } from './role-only';
import { Session } from './session/session';
import { demoContextProviders } from '../testing/demo-providers';

@Component({
    imports: [RoleOnly],
    template: `
        <button *appRoleOnly="roles()">Maintain inventory</button>
    `,
})
class RoleHost {
    readonly roles = signal<readonly DemoRole[]>(['administrator']);
}

it('removes protected action views when identity changes and reacts to allowed-role inputs', async () => {
    TestBed.configureTestingModule({ providers: demoContextProviders() });
    const f = TestBed.createComponent(RoleHost);
    await f.whenStable();
    expect(f.nativeElement.querySelector('button')).toBeNull();
    const session = TestBed.inject(Session);
    session.select('P013');
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('button')).toHaveLength(1);
    session.select('P001');
    await f.whenStable();
    expect(f.nativeElement.querySelector('button')).toBeNull();
    f.componentInstance.roles.set(['manager']);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('button')).toHaveLength(1);
});
