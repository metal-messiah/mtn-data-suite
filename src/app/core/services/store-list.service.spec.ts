import { TestBed, inject } from '@angular/core/testing';

import { StoreListService } from './store-list.service';

describe('StoreListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreListService]
    });
  });

  it('should be created', inject([StoreListService], (service: StoreListService) => {
    expect(service).toBeTruthy();
  }));
});
