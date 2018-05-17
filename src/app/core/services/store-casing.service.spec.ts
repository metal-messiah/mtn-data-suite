import { TestBed, inject } from '@angular/core/testing';

import { StoreCasingService } from './store-casing.service';

describe('StoreCasingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreCasingService]
    });
  });

  it('should be created', inject([StoreCasingService], (service: StoreCasingService) => {
    expect(service).toBeTruthy();
  }));
});
