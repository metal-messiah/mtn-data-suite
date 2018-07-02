import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportConsoleComponent } from './db-support-console.component';
import { DbSupportModule } from '../db-support.module';
import { RouterTestingModule } from '@angular/router/testing';
import { MapService } from '../../core/services/map.service';

describe('DbSupportConsoleComponent', () => {
  let component: DbSupportConsoleComponent;
  let fixture: ComponentFixture<DbSupportConsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DbSupportModule,
        RouterTestingModule
      ],
      providers: [
        {provide: MapService, useValue: {}}

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
