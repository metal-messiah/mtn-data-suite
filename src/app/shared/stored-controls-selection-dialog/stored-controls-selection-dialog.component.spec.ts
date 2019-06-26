import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoredControlsSelectionDialogComponent } from './stored-controls-selection-dialog.component';

describe('StoredControlsSelectionDialogComponent', () => {
  let component: StoredControlsSelectionDialogComponent;
  let fixture: ComponentFixture<StoredControlsSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoredControlsSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoredControlsSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
