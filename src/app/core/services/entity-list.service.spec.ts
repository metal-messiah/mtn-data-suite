import { TestBed, inject } from '@angular/core/testing';

import { EntityListService } from './entity-list.service';

describe('EntityListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityListService]
    });
  });

  it('should be created', inject([EntityListService], (service: EntityListService) => {
    expect(service).toBeTruthy();
  }));
});
