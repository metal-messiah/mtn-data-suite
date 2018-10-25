import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDownloadComponent } from './report-download.component';

describe('ReportDownloadComponent', () => {
  let component: ReportDownloadComponent;
  let fixture: ComponentFixture<ReportDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
