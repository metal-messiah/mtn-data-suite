import { TestBed, inject } from '@angular/core/testing';

import { StoreSourceService } from './store-source.service';

describe('SourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreSourceService]
    });
  });

  it('should be created', inject([StoreSourceService], (service: StoreSourceService) => {
    expect(service).toBeTruthy();
  }));
});
