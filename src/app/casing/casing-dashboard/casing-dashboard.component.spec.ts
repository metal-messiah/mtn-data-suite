import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingDashboardComponent } from './casing-dashboard.component';
import { SiteService } from '../../core/services/site.service';
import { SharedModule } from '../../shared/shared.module';
import { MapService } from '../../core/services/map.service';
import { MapComponent } from '../../shared/map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CasingDashboardComponent', () => {
  let component: CasingDashboardComponent;
  let fixture: ComponentFixture<CasingDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, BrowserAnimationsModule ],
      declarations: [CasingDashboardComponent],
      providers: [
        {provide: SiteService, useValue: {}},
        {provide: MapService, useValue: {}}
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
