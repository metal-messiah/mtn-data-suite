import { TestBed, inject } from '@angular/core/testing';

import { ShoppingCenterSurveyService } from './shopping-center-survey.service';

describe('ShoppingCenterSurveyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShoppingCenterSurveyService]
    });
  });

  it('should be created', inject([ShoppingCenterSurveyService], (service: ShoppingCenterSurveyService) => {
    expect(service).toBeTruthy();
  }));
});
