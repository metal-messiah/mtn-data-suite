import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundaryDialogComponent } from './boundary-dialog.component';

describe('BoundaryDialogComponent', () => {
  let component: BoundaryDialogComponent;
  let fixture: ComponentFixture<BoundaryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundaryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
