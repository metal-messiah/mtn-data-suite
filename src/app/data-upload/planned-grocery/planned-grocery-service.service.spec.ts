import { TestBed, inject } from '@angular/core/testing';
import { PlannedGroceryService } from './planned-grocery-service.service';


describe('PlannedGroceryServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlannedGroceryService]
    });
  });

  it('should be created', inject([PlannedGroceryService], (service: PlannedGroceryService) => {
    expect(service).toBeTruthy();
  }));
});
