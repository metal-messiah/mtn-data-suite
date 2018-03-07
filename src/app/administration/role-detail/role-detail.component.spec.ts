import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { RoleDetailComponent } from './role-detail.component';
import { AdministrationModule } from '../administration.module';
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
    const detailFormService = jasmine.createSpyObj('DetailFormService', ['retrieveObj', 'save', 'canDeactivate']);
    // TODO Mock return of retrieveObj
    // TODO Mock return of save
    // TODO Mock return of canDeactivate
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleServerError']);

    TestBed.configureTestingModule({
      imports: [
        AdministrationModule,
        RouterTestingModule
      ],
      providers: [
        {provide: RoleService, useValue: {}},
        {provide: PermissionService, useValue: permissionServiceSpy},
        {provide: DetailFormService, useValue: detailFormService},
        {provide: ErrorService, useValue: errorServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}
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
