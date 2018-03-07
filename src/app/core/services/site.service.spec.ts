import { TestBed, inject } from '@angular/core/testing';

import { SiteService } from './site.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';

describe('SiteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        SiteService,
        RestService
      ]
    });
  });

  it('should be created', inject([SiteService], (service: SiteService) => {
    expect(service).toBeTruthy();
  }));
});
