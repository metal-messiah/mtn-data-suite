import { TestBed, inject } from '@angular/core/testing';

import { HtmlDimensionsService } from './html-dimensions.service';

describe('HtmlDimensionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HtmlDimensionsService]
    });
  });

  it('should be created', inject([HtmlDimensionsService], (service: HtmlDimensionsService) => {
    expect(service).toBeTruthy();
  }));
});
