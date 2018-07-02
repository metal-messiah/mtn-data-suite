import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreVolumeDialogComponent } from './store-volume-dialog.component';

describe('StoreVolumeDialogComponent', () => {
  let component: StoreVolumeDialogComponent;
  let fixture: ComponentFixture<StoreVolumeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreVolumeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreVolumeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
