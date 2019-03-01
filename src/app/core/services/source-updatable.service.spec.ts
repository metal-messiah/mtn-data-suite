import { TestBed, inject } from '@angular/core/testing';

import { SourceUpdatableService } from './source-updatable.service';

describe('SourceUpdatableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SourceUpdatableService]
    });
  });

  it('should be created', inject([SourceUpdatableService], (service: SourceUpdatableService) => {
    expect(service).toBeTruthy();
  }));
});
