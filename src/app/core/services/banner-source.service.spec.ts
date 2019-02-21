import { TestBed, inject } from '@angular/core/testing';

import { BannerSourceService } from './banner-source.service';

describe('BannerSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BannerSourceService]
    });
  });

  it('should be created', inject([BannerSourceService], (service: BannerSourceService) => {
    expect(service).toBeTruthy();
  }));
});
