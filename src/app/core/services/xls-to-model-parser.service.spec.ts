import { TestBed, inject } from '@angular/core/testing';

import { XlsToModelParserService } from './xls-to-model-parser.service';

describe('XlsToModelParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XlsToModelParserService]
    });
  });

  it('should be created', inject([XlsToModelParserService], (service: XlsToModelParserService) => {
    expect(service).toBeTruthy();
  }));
});
