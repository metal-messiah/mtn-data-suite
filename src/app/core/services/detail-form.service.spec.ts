import { TestBed, inject } from '@angular/core/testing';

import { DetailFormService } from './detail-form.service';

describe('DetailFormService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetailFormService]
    });
  });

  it('should be created', inject([DetailFormService], (service: DetailFormService) => {
    expect(service).toBeTruthy();
  }));
});
