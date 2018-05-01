import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingDashboardComponent } from './casing-dashboard.component';
import { SiteService } from '../../core/services/site.service';
import { SharedModule } from '../../shared/shared.module';
import { MapService } from '../../core/services/map.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconService } from '../../core/services/icon.service';
import { CasingDashboardService } from './casing-dashboard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { GeocoderService } from '../../core/services/geocoder.service';
import { LabelService } from '../../core/services/label.service';
import { NavigatorService } from '../../core/services/navigator.service';
import { StoreService } from '../../core/services/store.service';
import { of } from 'rxjs/observable/of';

describe('CasingDashboardComponent', () => {
  let component: CasingDashboardComponent;
  let fixture: ComponentFixture<CasingDashboardComponent>;

  beforeEach(async(() => {
    const mapServiceSpy = jasmine.createSpyObj('MapService', ['initialize', 'setZoom', 'setCenter']);

    TestBed.configureTestingModule({
      imports: [ SharedModule, BrowserAnimationsModule, RouterTestingModule ],
      declarations: [CasingDashboardComponent],
      providers: [
        {provide: SiteService, useValue: {}},
        {provide: StoreService, useValue: {}},
        {provide: MapService, useValue: mapServiceSpy},
        {provide: GeocoderService, useValue: {}},
        {provide: CasingDashboardService, useValue: {getSavedPerspective: () => of('nothing')}},
        {provide: NavigatorService, useValue: {}},
        LabelService,
        IconService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
