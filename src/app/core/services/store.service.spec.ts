import { TestBed, inject } from '@angular/core/testing';

import { StoreService } from './store.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';

describe('StoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [StoreService, RestService]
    });
  });

  it('should be created', inject([StoreService], (service: StoreService) => {
    expect(service).toBeTruthy();
  }));
});
