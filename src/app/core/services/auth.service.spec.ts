import { TestBed, inject } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestService } from './rest.service';
import { SharedModule } from '../../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule
      ],
      providers: [
        AuthService,
        RestService,
        {provide: APP_BASE_HREF, useValue: '/'},
        {provide: Location, useValue: {hash: '',  path: () => '' }}
      ]
    });
  });

  it('should ...', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
