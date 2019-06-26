import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRemoveStoresListDialogComponent } from './add-remove-stores-list-dialog.component';

describe('AddRemoveStoresListDialogComponent', () => {
  let component: AddRemoveStoresListDialogComponent;
  let fixture: ComponentFixture<AddRemoveStoresListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRemoveStoresListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRemoveStoresListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
