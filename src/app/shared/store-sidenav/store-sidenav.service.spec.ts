import { TestBed, inject } from '@angular/core/testing';

import { StoreListUIService } from './store-list-u-i.service';

describe('StoreSidenavService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreListUIService]
    });
  });

  it('should be created', inject([StoreListUIService], (service: StoreListUIService) => {
    expect(service).toBeTruthy();
  }));
});
