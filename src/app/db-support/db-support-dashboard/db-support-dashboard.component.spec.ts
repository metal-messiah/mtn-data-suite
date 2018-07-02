import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportDashboardComponent } from './db-support-dashboard.component';
import { DbSupportModule } from '../db-support.module';
import { MapService } from '../../core/services/map.service';

describe('DbSupportDashboardComponent', () => {
  let component: DbSupportDashboardComponent;
  let fixture: ComponentFixture<DbSupportDashboardComponent>;

  beforeEach(async(() => {
    const mapServiceSpy = jasmine.createSpyObj('MapService', ['initialize', 'setZoom', 'setCenter']);

    TestBed.configureTestingModule({
      imports: [DbSupportModule],
      providers: [
        {provide: MapService, useValue: mapServiceSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
