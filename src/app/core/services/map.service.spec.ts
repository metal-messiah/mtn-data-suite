import { TestBed, inject } from '@angular/core/testing';

import { MapService } from './map.service';
import { IconService } from './icon.service';

describe('MapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapService, IconService]
    });
  });

  it('should be created', inject([MapService], (service: MapService) => {
    expect(service).toBeTruthy();
  }));
});
