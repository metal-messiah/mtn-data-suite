import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { EntityListService } from '../../core/services/entity-list.service';
import { UserProfileService } from '../../core/services/user.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const entityListServiceSpy = jasmine.createSpyObj('EntityListService', ['initialize', 'confirmDelete'])
    // TODO Mock return of initialize
    // TODO Mock return of confirmDelete

    TestBed.configureTestingModule({
      imports: [ AdministrationModule ],
      providers: [
        {provide: UserProfileService, useValue: {}},
        {provide: EntityListService, useValue: entityListServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
        {provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
