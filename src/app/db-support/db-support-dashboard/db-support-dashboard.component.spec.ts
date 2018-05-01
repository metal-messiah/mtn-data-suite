import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportDashboardComponent } from './db-support-dashboard.component';
import { DbSupportModule } from '../db-support.module';

describe('DbSupportDashboardComponent', () => {
  let component: DbSupportDashboardComponent;
  let fixture: ComponentFixture<DbSupportDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DbSupportModule]
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
