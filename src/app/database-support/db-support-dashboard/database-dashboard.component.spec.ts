import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseDashboardComponent } from './database-dashboard.component';

describe('DatabaseDashboardComponent', () => {
  let component: DatabaseDashboardComponent;
  let fixture: ComponentFixture<DatabaseDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabaseDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
