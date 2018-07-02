import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuadDialogComponent } from './quad-dialog.component';

describe('QuadDialogComponent', () => {
  let component: QuadDialogComponent;
  let fixture: ComponentFixture<QuadDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
