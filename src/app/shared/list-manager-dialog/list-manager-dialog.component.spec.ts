import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListManagerDialogComponent } from './list-manager-dialog.component';

describe('ListManagerDialogComponent', () => {
	let component: ListManagerDialogComponent;
	let fixture: ComponentFixture<ListManagerDialogComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				declarations: [ ListManagerDialogComponent ]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ListManagerDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
