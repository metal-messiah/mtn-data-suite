import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSelectComponent } from './user-profile-select.component';

describe('UserProfileSelectComponent', () => {
  let component: UserProfileSelectComponent;
  let fixture: ComponentFixture<UserProfileSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
