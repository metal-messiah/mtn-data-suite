import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoMenuComponent } from './logo-menu.component';
import { SharedModule } from '../shared.module';
import { AuthService } from '../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('LogoMenuComponent', () => {
  let component: LogoMenuComponent;
  let fixture: ComponentFixture<LogoMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService, useValue: {
            login: () => {},
            logout: () => {},
            isAuthenticated: () => {}
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
