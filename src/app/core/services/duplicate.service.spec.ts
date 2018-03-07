import { TestBed, inject } from '@angular/core/testing';

import { DuplicateService } from './duplicate.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';

describe('DuplicateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        DuplicateService,
        RestService
      ]
    });
  });

  it('should be created', inject([DuplicateService], (service: DuplicateService) => {
    expect(service).toBeTruthy();
  }));
});
