import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadsheetDataFormComponent } from './spreadsheet-data-form.component';

describe('SpreadsheetDataFormComponent', () => {
    let component: SpreadsheetDataFormComponent;
    let fixture: ComponentFixture<SpreadsheetDataFormComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [ SpreadsheetDataFormComponent ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SpreadsheetDataFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
