import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteOverviewComponent } from './site-overview.component';
import { CasingModule } from '../casing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SiteService } from '../../core/services/site.service';
import { ShoppingCenterCasingService } from '../../core/services/shopping-center-casing.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { ActivatedRoute } from '@angular/router';
import { Site } from '../../models/full/site';
import { of } from 'rxjs/observable/of';
import { ShoppingCenterCasing } from '../../models/full/shopping-center-casing';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SiteOverviewComponent', () => {
  let component: SiteOverviewComponent;
  let fixture: ComponentFixture<SiteOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule, RouterTestingModule],
      declarations: [SiteOverviewComponent],
      providers: [
        {
          provide: SiteService, useValue: {
            getOneById: (id) => of(new Site({}))
          }
        },
        {
          provide: ShoppingCenterCasingService, useValue: {
            getOneById: (id) => of(new ShoppingCenterCasing({}))
          }
        },
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
