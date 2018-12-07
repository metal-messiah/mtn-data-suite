import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgDataFormComponent } from './spreadsheet-data-form.component';

describe('PgDataFormComponent', () => {
	let component: PgDataFormComponent;
	let fixture: ComponentFixture<PgDataFormComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				declarations: [ PgDataFormComponent ]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(PgDataFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
