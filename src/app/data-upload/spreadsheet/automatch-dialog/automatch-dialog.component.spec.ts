import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatchDialogComponent } from './automatch-dialog.component';

describe('AutomatchDialogComponent', () => {
  let component: AutomatchDialogComponent;
  let fixture: ComponentFixture<AutomatchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutomatchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomatchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
