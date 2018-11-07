import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignFieldsDialogComponent } from './assign-fields-dialog.component';

describe('AssignFieldsDialogComponent', () => {
  let component: AssignFieldsDialogComponent;
  let fixture: ComponentFixture<AssignFieldsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignFieldsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
