import { TestBed, inject } from '@angular/core/testing';

import { ExtractionFieldSetService } from './extraction-field-set.service';

describe('ExtractionFieldSetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtractionFieldSetService]
    });
  });

  it('should be created', inject([ExtractionFieldSetService], (service: ExtractionFieldSetService) => {
    expect(service).toBeTruthy();
  }));
});
