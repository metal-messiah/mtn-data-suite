import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportActivitySelectionComponent } from './db-support-activity-selection.component';

describe('DbSupportActivitySelectionComponent', () => {
  let component: DbSupportActivitySelectionComponent;
  let fixture: ComponentFixture<DbSupportActivitySelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportActivitySelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportActivitySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
