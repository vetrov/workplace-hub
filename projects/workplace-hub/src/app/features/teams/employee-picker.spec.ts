import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeePicker } from 'ui';

@Component({
    imports: [ReactiveFormsModule, EmployeePicker],
    template: `
        <ui-employee-picker
            fieldId="employee-test"
            [options]="options()"
            [formControl]="person"
        />
    `,
})
class PickerHost {
    readonly options = signal([
        { value: 'P025', label: 'Alex Garcia' },
        { value: 'P026', label: 'Morgan Garcia' },
    ]);
    readonly person = new FormControl<string | null>(
        'P025',
        Validators.required,
    );
}

describe('employee picker Reactive Forms integration', () => {
    it('displays initial/reset values without marking dirty and propagates keyboard-native edits/touch', async () => {
        const f = TestBed.createComponent(PickerHost);
        await f.whenStable();
        const host = f.componentInstance,
            select = f.nativeElement.querySelector(
                'select',
            ) as HTMLSelectElement;
        expect(select.value).toBe('P025');
        expect(host.person.pristine).toBe(true);
        expect(host.person.untouched).toBe(true);
        select.value = 'P026';
        select.dispatchEvent(new Event('change'));
        select.dispatchEvent(new Event('blur'));
        await f.whenStable();
        expect(host.person.value).toBe('P026');
        expect(host.person.dirty).toBe(true);
        expect(host.person.touched).toBe(true);
        host.person.reset('P025');
        await f.whenStable();
        expect(select.value).toBe('P025');
        expect(host.person.pristine).toBe(true);
    });

    it('revalidates option changes while retaining unavailable selections and ignoring disabled edits', async () => {
        const f = TestBed.createComponent(PickerHost);
        await f.whenStable();
        const host = f.componentInstance,
            select = f.nativeElement.querySelector(
                'select',
            ) as HTMLSelectElement;
        host.options.set([{ value: 'P026', label: 'Morgan Garcia' }]);
        await f.whenStable();
        expect(host.person.errors?.['unknownOption']).toBe(true);
        expect(select.value).toBe('P025');
        expect(select.selectedOptions[0].disabled).toBe(true);
        expect(host.person.pristine).toBe(true);
        host.person.disable();
        await f.whenStable();
        expect(select.disabled).toBe(true);
        select.value = 'P026';
        select.dispatchEvent(new Event('change'));
        expect(host.person.value).toBe('P025');
        host.person.enable();
        host.person.setValue('P026');
        await f.whenStable();
        expect(host.person.valid).toBe(true);
        expect(select.value).toBe('P026');
    });
});
