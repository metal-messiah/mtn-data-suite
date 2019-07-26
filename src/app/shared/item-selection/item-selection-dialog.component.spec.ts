import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSelectionDialogComponent } from './item-selection-dialog.component';

describe('ItemSelectionDialogComponent', () => {
  let component: ItemSelectionDialogComponent;
  let fixture: ComponentFixture<ItemSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
