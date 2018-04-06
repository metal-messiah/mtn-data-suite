import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../core/services/auth.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AdministrationModule,
        RouterTestingModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
        {
          provide: AuthService, useValue: {
            signIn: () => {},
            logout: () => {},
            isAuthenticated: () => {}
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
