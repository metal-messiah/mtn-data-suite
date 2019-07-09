import { TestBed } from '@angular/core/testing';

import { StoreCasingDetailService } from './store-casing-detail.service';

describe('StoreCasingDetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreCasingDetailService = TestBed.get(StoreCasingDetailService);
    expect(service).toBeTruthy();
  });
});
