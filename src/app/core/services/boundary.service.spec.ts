import { TestBed } from '@angular/core/testing';

import { BoundaryService } from './boundary.service';

describe('BoundaryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoundaryService = TestBed.get(BoundaryService);
    expect(service).toBeTruthy();
  });
});
