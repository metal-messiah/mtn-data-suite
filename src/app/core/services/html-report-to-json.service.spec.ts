import { TestBed, inject } from '@angular/core/testing';

import { HtmlReportToJsonService } from './html-report-to-json.service';

describe('HtmlReportToJsonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HtmlReportToJsonService]
    });
  });

  it('should be created', inject([HtmlReportToJsonService], (service: HtmlReportToJsonService) => {
    expect(service).toBeTruthy();
  }));
});
