import { TestBed, inject } from '@angular/core/testing';

import { StoreVolumeService } from './store-volume.service';

describe('StoreVolumeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreVolumeService]
    });
  });

  it('should be created', inject([StoreVolumeService], (service: StoreVolumeService) => {
    expect(service).toBeTruthy();
  }));
});
