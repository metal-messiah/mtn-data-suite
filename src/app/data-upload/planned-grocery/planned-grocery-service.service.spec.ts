import { TestBed, inject } from '@angular/core/testing';

import { PlannedGroceryServiceService } from './planned-grocery-service.service';

describe('PlannedGroceryServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlannedGroceryServiceService]
    });
  });

  it('should be created', inject([PlannedGroceryServiceService], (service: PlannedGroceryServiceService) => {
    expect(service).toBeTruthy();
  }));
});
