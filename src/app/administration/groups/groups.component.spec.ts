import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsComponent } from './groups.component';
import { AdministrationModule } from '../administration.module';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { EntityListService } from '../../core/services/entity-list.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const entityListServiceSpy = jasmine.createSpyObj('EntityListService', ['initialize', 'confirmDelete'])
    // TODO Mock return of initialize
    // TODO Mock return of confirmDelete

    TestBed.configureTestingModule({
      imports: [ AdministrationModule ],
      providers: [
        {provide: GroupService, useValue: {}},
        {provide: EntityListService, useValue: entityListServiceSpy},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
        {provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
