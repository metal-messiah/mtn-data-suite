import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDetailComponent } from './site-detail.component';
import { SiteService } from '../../core/services/site.service';
import { CasingService } from '../casing.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DetailFormService } from '../../core/services/detail-form.service';
import { CasingModule } from '../casing.module';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';

describe('SiteDetailComponent', () => {
  let component: SiteDetailComponent;
  let fixture: ComponentFixture<SiteDetailComponent>;

  beforeEach(async(() => {
    const detailFormService = jasmine.createSpyObj('DetailFormService', ['retrieveObj', 'save', 'canDeactivate']);

    TestBed.configureTestingModule({
      imports: [
        CasingModule,
        RouterTestingModule
      ],
      providers: [
        {provide: SiteService, useValue: {}},
        {provide: CasingService, useValue: {}},
        {provide: DetailFormService, useValue: detailFormService},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
