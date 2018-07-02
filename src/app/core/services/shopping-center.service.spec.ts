import { TestBed, inject } from '@angular/core/testing';

import { ShoppingCenterService } from './shopping-center.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';

describe('ShoppingCenterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShoppingCenterService, RestService]
    });
  });

  it('should be created', inject([ShoppingCenterService], (service: ShoppingCenterService) => {
    expect(service).toBeTruthy();
  }));
});
