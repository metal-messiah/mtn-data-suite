import { TestBed } from '@angular/core/testing';

import { GravityService } from './gravity.service';

describe('GravityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GravityService = TestBed.get(GravityService);
    expect(service).toBeTruthy();
  });
});
