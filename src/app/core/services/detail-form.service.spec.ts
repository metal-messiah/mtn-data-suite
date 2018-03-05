import { TestBed, inject } from '@angular/core/testing';

import { DetailFormService } from './detail-form.service';
import { SharedModule } from '../../shared/shared.module';
import { ErrorService } from './error.service';

describe('DetailFormService', () => {
  const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleServerError']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        DetailFormService,
        {provide: ErrorService, useValue: errorServiceSpy},
      ]
    });
  });

  it('should be created', inject([DetailFormService], (service: DetailFormService<any>) => {
    expect(service).toBeTruthy();
  }));
});
