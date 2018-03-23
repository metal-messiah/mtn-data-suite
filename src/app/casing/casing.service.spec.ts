import { TestBed, inject } from '@angular/core/testing';

import { CasingService } from './casing.service';
import { SharedModule } from '../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('CasingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      providers: [CasingService]
    });
  });

  it('should be created', inject([CasingService], (service: CasingService) => {
    expect(service).toBeTruthy();
  }));
});
