import { TestBed, inject } from '@angular/core/testing';

import { CasingDashboardService } from './casing-dashboard.service';
import { SharedModule } from '../../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('CasingDashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      providers: [CasingDashboardService]
    });
  });

  it('should be created', inject([CasingDashboardService], (service: CasingDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
