import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportModelDataComponent } from './report-model-data.component';

describe('ReportModelDataComponent', () => {
  let component: ReportModelDataComponent;
  let fixture: ComponentFixture<ReportModelDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportModelDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportModelDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
