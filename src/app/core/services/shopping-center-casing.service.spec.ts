import { TestBed, inject } from '@angular/core/testing';

import { ShoppingCenterCasingService } from './shopping-center-casing.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';

describe('ShoppingCenterCasingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ShoppingCenterCasingService, RestService]
    });
  });

  it('should be created', inject([ShoppingCenterCasingService], (service: ShoppingCenterCasingService) => {
    expect(service).toBeTruthy();
  }));
});
