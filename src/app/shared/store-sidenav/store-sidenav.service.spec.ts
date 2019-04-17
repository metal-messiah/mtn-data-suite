import { TestBed, inject } from '@angular/core/testing';

import { StoreSidenavService } from './store-sidenav.service';

describe('StoreSidenavService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreSidenavService]
    });
  });

  it('should be created', inject([StoreSidenavService], (service: StoreSidenavService) => {
    expect(service).toBeTruthy();
  }));
});
