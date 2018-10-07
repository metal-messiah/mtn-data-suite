import { TestBed, inject } from '@angular/core/testing';

import { HtmlToModelParser } from './html-to-model-parser.service';

describe('HtmlReportToJsonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HtmlToModelParser]
    });
  });

  it('should be created', inject([HtmlToModelParser], (service: HtmlToModelParser) => {
    expect(service).toBeTruthy();
  }));
});
