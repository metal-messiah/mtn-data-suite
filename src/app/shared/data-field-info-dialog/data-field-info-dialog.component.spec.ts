import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFieldInfoDialogComponent } from './data-field-info-dialog.component';

describe('DataFieldInfoDialogComponent', () => {
  let component: DataFieldInfoDialogComponent;
  let fixture: ComponentFixture<DataFieldInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFieldInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFieldInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
