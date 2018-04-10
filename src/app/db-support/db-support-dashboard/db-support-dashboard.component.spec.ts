import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportDashboardComponent } from './db-support-dashboard.component';

describe('DbSupportDashboardComponent', () => {
  let component: DbSupportDashboardComponent;
  let fixture: ComponentFixture<DbSupportDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportDashboardComponent ]
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
