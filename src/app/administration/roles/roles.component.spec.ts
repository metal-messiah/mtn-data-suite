import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesComponent } from './roles.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { EntityListService } from '../../core/services/entity-list.service';
import { RoleService } from '../../core/services/role.service';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const entityListServiceSpy = jasmine.createSpyObj('EntityListService', ['initialize', 'confirmDelete'])
    // TODO Mock return of initialize
    // TODO Mock return of confirmDelete

    TestBed.configureTestingModule({
      imports: [ AdministrationModule ],
      providers: [
        {provide: RoleService, useValue: {}},
        {provide: EntityListService, useValue: entityListServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
        {provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
