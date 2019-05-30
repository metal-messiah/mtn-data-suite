import { TestBed, inject } from '@angular/core/testing';

import { SiteMarkerService } from './site-marker.service';

describe('SiteMarkerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiteMarkerService]
    });
  });

  it('should be created', inject([SiteMarkerService], (service: SiteMarkerService) => {
    expect(service).toBeTruthy();
  }));
});
