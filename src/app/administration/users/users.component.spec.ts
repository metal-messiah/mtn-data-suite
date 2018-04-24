import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfilesComponent } from './user-profiles.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { EntityListService } from '../../core/services/entity-list.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('UserProfilesComponent', () => {
  let component: UserProfilesComponent;
  let fixture: ComponentFixture<UserProfilesComponent>;

  beforeEach(async(() => {
    const entityListServiceSpy = jasmine.createSpyObj('EntityListService', ['initialize', 'confirmDelete'])
    // TODO Mock return of initialize
    // TODO Mock return of confirmDelete

    TestBed.configureTestingModule({
      imports: [
        AdministrationModule,
        RouterTestingModule
      ],
      providers: [
        {provide: UserProfileService, useValue: {}},
        {provide: EntityListService, useValue: entityListServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
