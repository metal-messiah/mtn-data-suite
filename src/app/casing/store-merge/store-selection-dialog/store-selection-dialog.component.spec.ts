import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSelectionDialogComponent } from './store-selection-dialog.component';

describe('StoreSelectionDialogComponent', () => {
  let component: StoreSelectionDialogComponent;
  let fixture: ComponentFixture<StoreSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
