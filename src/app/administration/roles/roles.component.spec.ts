import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesComponent } from './roles.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { EntityListService } from '../../core/services/entity-list.service';
import { RoleService } from '../../core/services/role.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;

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
        {provide: RoleService, useValue: {}},
        {provide: EntityListService, useValue: entityListServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}
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
