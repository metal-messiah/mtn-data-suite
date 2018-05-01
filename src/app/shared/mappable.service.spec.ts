import { TestBed, inject } from '@angular/core/testing';

import { MappableService } from './mappable.service';

describe('MappableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MappableService]
    });
  });

  it('should be created', inject([MappableService], (service: MappableService) => {
    expect(service).toBeTruthy();
  }));
});
