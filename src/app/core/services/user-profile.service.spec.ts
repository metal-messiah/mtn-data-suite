import { TestBed, inject } from '@angular/core/testing';

import { UserProfileService } from './user-profile.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';

describe('UserProfileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserProfileService, RestService]
    });
  });

  it('should be created', inject([UserProfileService], (service: UserProfileService) => {
    expect(service).toBeTruthy();
  }));
});
