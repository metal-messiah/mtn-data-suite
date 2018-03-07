import { TestBed, inject } from '@angular/core/testing';

import { DuplicateService } from './duplicate.service';

describe('DuplicateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DuplicateService]
    });
  });

  it('should be created', inject([DuplicateService], (service: DuplicateService) => {
    expect(service).toBeTruthy();
  }));
});
