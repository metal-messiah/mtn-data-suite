import { TestBed } from '@angular/core/testing';

import { SiteWiseService } from './site-wise.service';

describe('SiteWiseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SiteWiseService = TestBed.get(SiteWiseService);
    expect(service).toBeTruthy();
  });
});
