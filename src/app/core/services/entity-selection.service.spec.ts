import { TestBed, inject } from '@angular/core/testing';

import { EntitySelectionService } from './entity-selection.service';

describe('EntitySelectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntitySelectionService]
    });
  });

  it('should be created', inject([EntitySelectionService], (service: EntitySelectionService) => {
    expect(service).toBeTruthy();
  }));
});
