import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleSelectDialogComponent } from './simple-select-dialog.component';

describe('SimpleSelectDialogComponent', () => {
  let component: SimpleSelectDialogComponent;
  let fixture: ComponentFixture<SimpleSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
