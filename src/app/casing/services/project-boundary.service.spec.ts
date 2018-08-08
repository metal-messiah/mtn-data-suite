import { TestBed, inject } from '@angular/core/testing';

import { ProjectBoundaryService } from './project-boundary.service';

describe('ProjectBoundaryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectBoundaryService]
    });
  });

  it('should be created', inject([ProjectBoundaryService], (service: ProjectBoundaryService) => {
    expect(service).toBeTruthy();
  }));
});
