import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDetailComponent } from './role-detail.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { DetailFormService } from '../../core/services/detail-form.service';
import { RoleService } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';
import { ErrorService } from '../../core/services/error.service';
import { of } from 'rxjs/observable/of';

describe('RoleDetailComponent', () => {
  let component: RoleDetailComponent;
  let fixture: ComponentFixture<RoleDetailComponent>;

  beforeEach(async(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['getPermissions']);
    permissionServiceSpy.getPermissions.and.returnValue(of({content: []}));
    // TODO Mcok return of getPermissions
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const detailFormService = jasmine.createSpyObj('DetailFormService', ['retrieveObj', 'save', 'canDeactivate']);
    // TODO Mock return of retrieveObj
    // TODO Mock return of save
    // TODO Mock return of canDeactivate
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleServerError']);

    TestBed.configureTestingModule({
      imports: [ AdministrationModule ],
      providers: [
        {provide: RoleService, useValue: {}},
        {provide: PermissionService, useValue: permissionServiceSpy},
        {provide: DetailFormService, useValue: detailFormService},
        {provide: ErrorService, useValue: errorServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
        {provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
