import { TestBed } from '@angular/core/testing';

import { CasingProjectService } from './casing-project.service';

describe('CasingProjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CasingProjectService = TestBed.get(CasingProjectService);
    expect(service).toBeTruthy();
  });
});
