import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreAttrSelectionDialogComponent } from './store-attr-selection-dialog.component';

describe('StoreAttrSelectionDialogComponent', () => {
  let component: StoreAttrSelectionDialogComponent;
  let fixture: ComponentFixture<StoreAttrSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreAttrSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreAttrSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
