import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStatusesDialogComponent } from './store-statuses-dialog.component';

describe('StoreStatusesDialogComponent', () => {
  let component: StoreStatusesDialogComponent;
  let fixture: ComponentFixture<StoreStatusesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreStatusesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreStatusesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
