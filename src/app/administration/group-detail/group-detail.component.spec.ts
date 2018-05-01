import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDetailComponent } from './group-detail.component';
import { AdministrationModule } from '../administration.module';
import { GroupService } from '../../core/services/group.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { ActivatedRoute } from '@angular/router';
import { DetailFormService } from '../../core/services/detail-form.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;

  beforeEach(async(() => {
    const detailFormService = jasmine.createSpyObj('DetailFormService', ['retrieveObj', 'save', 'canDeactivate']);
    // TODO Mock return of retrieveObj
    // TODO Mock return of create
    // TODO Mock return of canDeactivate

    TestBed.configureTestingModule({
      imports: [
        AdministrationModule,
        RouterTestingModule
      ],
      providers: [
        {provide: GroupService, useValue: {}},
        {provide: DetailFormService, useValue: detailFormService},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
