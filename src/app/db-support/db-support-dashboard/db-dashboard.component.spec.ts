import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbDashboardComponent } from './db-dashboard.component';

describe('DbDashboardComponent', () => {
  let component: DbDashboardComponent;
  let fixture: ComponentFixture<DbDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
