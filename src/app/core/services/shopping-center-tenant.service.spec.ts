import { TestBed, inject } from '@angular/core/testing';

import { ShoppingCenterTenantService } from './shopping-center-tenant.service';

describe('ShoppingCenterTenantService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShoppingCenterTenantService]
    });
  });

  it('should be created', inject([ShoppingCenterTenantService], (service: ShoppingCenterTenantService) => {
    expect(service).toBeTruthy();
  }));
});
