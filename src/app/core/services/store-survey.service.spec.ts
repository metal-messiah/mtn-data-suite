import { TestBed, inject } from '@angular/core/testing';

import { StoreSurveyService } from './store-survey.service';

describe('StoreSurveyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreSurveyService]
    });
  });

  it('should be created', inject([StoreSurveyService], (service: StoreSurveyService) => {
    expect(service).toBeTruthy();
  }));
});
