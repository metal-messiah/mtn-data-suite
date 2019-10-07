import { TestBed } from '@angular/core/testing';

import { BoundaryDialogService } from './boundary-dialog.service';

describe('BoundaryDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoundaryDialogService = TestBed.get(BoundaryDialogService);
    expect(service).toBeTruthy();
  });
});
