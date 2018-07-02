import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportComponent } from './db-support.component';
import { DbSupportModule } from './db-support.module';
import { RouterTestingModule } from '@angular/router/testing';
import { MapService } from '../core/services/map.service';

describe('DbSupportComponent', () => {
  let component: DbSupportComponent;
  let fixture: ComponentFixture<DbSupportComponent>;

  beforeEach(async(() => {
    const mapServiceSpy = jasmine.createSpyObj('MapService', ['initialize', 'setZoom', 'setCenter']);

    TestBed.configureTestingModule({
      imports: [
        DbSupportModule,
        RouterTestingModule
      ],
      providers: [
        {provide: MapService, useValue: mapServiceSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
