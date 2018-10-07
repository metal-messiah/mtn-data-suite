import { TestBed, inject } from '@angular/core/testing';

import { ReportBuilderService } from './report-builder.service';

describe('ReportBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportBuilderService]
    });
  });

  it('should be created', inject([ReportBuilderService], (service: ReportBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
