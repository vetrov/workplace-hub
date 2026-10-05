import { TestBed } from '@angular/core/testing';
import { SupplierEditor } from './supplier-editor';
import { SupplierWidgetsModule } from './supplier-widgets';

describe('legacy supplier editor lifecycle and projected field queries', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({ imports: [SupplierWidgetsModule] }),
    );

    it('loads aliased record data without marking dirty and reflects later input changes', async () => {
        const fixture = TestBed.createComponent(SupplierEditor);
        const record = {
            id: 'S001',
            name: 'Nordic Devices',
            contactName: 'Dana Smith',
            email: 'dana@nordic.example',
            phone: '',
            notes: '',
            version: 1,
        };
        fixture.componentRef.setInput('record', record);
        await fixture.whenStable();
        expect(fixture.componentInstance.form.getRawValue().name).toBe(
            record.name,
        );
        expect(fixture.componentInstance.form.pristine).toBe(true);
        fixture.componentRef.setInput('record', {
            ...record,
            email: 'new@nordic.example',
        });
        await fixture.whenStable();
        expect(
            fixture.nativeElement.querySelector('#supplier-email').value,
        ).toBe('new@nordic.example');
    });

    it('touches invalid fields and focuses a projected control through decorator queries', async () => {
        const fixture = TestBed.createComponent(SupplierEditor);
        fixture.componentRef.setInput('record', null);
        await fixture.whenStable();
        fixture.nativeElement
            .querySelector('form')
            .dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true }),
            );
        await fixture.whenStable();
        expect(fixture.componentInstance.form.touched).toBe(true);
        expect(document.activeElement?.id).toBe('supplier-name');
        expect(fixture.nativeElement.textContent).toContain('Supplier name');
    });

    it('emits one validated intent and disables controls while busy', async () => {
        const fixture = TestBed.createComponent(SupplierEditor);
        fixture.componentRef.setInput('record', null);
        await fixture.whenStable();
        fixture.componentInstance.form.setValue({
            name: 'Nordic Devices',
            contactName: 'Dana Smith',
            email: 'dana@nordic.example',
            phone: '',
            notes: '',
        });
        const saved = vi.fn();
        fixture.componentInstance.saved.subscribe(saved);
        fixture.componentInstance.save();
        expect(saved).toHaveBeenCalledOnce();
        fixture.componentRef.setInput('busy', '');
        await fixture.whenStable();
        expect(
            fixture.nativeElement.querySelector('#supplier-name').disabled,
        ).toBe(true);
        fixture.componentInstance.save();
        expect(saved).toHaveBeenCalledOnce();
    });
});
