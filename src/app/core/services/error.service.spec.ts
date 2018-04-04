import { TestBed, inject } from '@angular/core/testing';

import { ErrorService } from './error.service';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from './auth.service';

describe('ErrorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ],
      providers: [
        ErrorService,
        {provide: AuthService, useValue: {login: () => {}}}
      ]
    });
  });

  it('should be created', inject([ErrorService], (service: ErrorService) => {
    expect(service).toBeTruthy();
  }));
});
