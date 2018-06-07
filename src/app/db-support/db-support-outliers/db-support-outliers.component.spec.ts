import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportOutliersComponent } from './db-support-outliers.component';

describe('DbSupportOutliersComponent', () => {
  let component: DbSupportOutliersComponent;
  let fixture: ComponentFixture<DbSupportOutliersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportOutliersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportOutliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
