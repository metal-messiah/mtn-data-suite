import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessListDialogComponent } from './access-list-dialog.component';

describe('AccessListDialogComponent', () => {
  let component: AccessListDialogComponent;
  let fixture: ComponentFixture<AccessListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
