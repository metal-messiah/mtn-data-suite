import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailComponent } from './user-detail.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { DetailFormService } from '../../core/services/detail-form.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { RoleService } from '../../core/services/role.service';
import { ErrorService } from '../../core/services/error.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  beforeEach(async(() => {
    const roleServiceSpy = jasmine.createSpyObj('RoleService', ['getAllRoles']);
    roleServiceSpy.getAllRoles.and.returnValue(of({content: []}));
    const groupServiceSpy = jasmine.createSpyObj('GroupService', ['getAllGroups']);
    groupServiceSpy.getAllGroups.and.returnValue(of({content: []}));
    const detailFormService = jasmine.createSpyObj('DetailFormService', ['retrieveObj', 'save', 'canDeactivate']);
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleServerError']);

    TestBed.configureTestingModule({
      imports: [
        AdministrationModule,
        RouterTestingModule
      ],
      providers: [
        {provide: UserProfileService, useValue: {}},
        {provide: RoleService, useValue: roleServiceSpy},
        {provide: GroupService, useValue: groupServiceSpy},
        {provide: ErrorService, useValue: errorServiceSpy},
        {provide: DetailFormService, useValue: detailFormService},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
