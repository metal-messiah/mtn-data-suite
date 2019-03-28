import { TestBed, inject } from '@angular/core/testing';

import { DbEntityMarkerService } from './db-entity-marker.service';

describe('DbEntityMarkerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbEntityMarkerService]
    });
  });

  it('should be created', inject([DbEntityMarkerService], (service: DbEntityMarkerService) => {
    expect(service).toBeTruthy();
  }));
});
