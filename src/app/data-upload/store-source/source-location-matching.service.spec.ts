import { TestBed } from '@angular/core/testing';

import { SourceLocationMatchingService } from './source-location-matching.service';

describe('SourceLocationMatchingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SourceLocationMatchingService = TestBed.get(SourceLocationMatchingService);
    expect(service).toBeTruthy();
  });
});
