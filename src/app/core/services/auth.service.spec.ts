import { TestBed, inject } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RestService } from './rest.service';
import { SharedModule } from '../../shared/shared.module';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SharedModule,
        RouterModule.forRoot([])
      ],
      providers: [
        AuthService,
        RestService,
        {provide: APP_BASE_HREF, useValue: '/'},
        {provide: Router, useValue: { navigate: () => {} }},
        {provide: Location, useValue: {hash: '',  path: () => '' }}
      ]
    });
  });

  it('should ...', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
