import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTotalSizeDialogComponent } from './edit-total-size-dialog.component';

describe('EditTotalSizeDialogComponent', () => {
  let component: EditTotalSizeDialogComponent;
  let fixture: ComponentFixture<EditTotalSizeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTotalSizeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTotalSizeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
