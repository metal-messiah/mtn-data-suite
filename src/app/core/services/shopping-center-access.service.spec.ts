import { TestBed, inject } from '@angular/core/testing';

import { ShoppingCenterAccessService } from './shopping-center-access.service';

describe('ShoppingCenterAccessService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShoppingCenterAccessService]
    });
  });

  it('should be created', inject([ShoppingCenterAccessService], (service: ShoppingCenterAccessService) => {
    expect(service).toBeTruthy();
  }));
});
