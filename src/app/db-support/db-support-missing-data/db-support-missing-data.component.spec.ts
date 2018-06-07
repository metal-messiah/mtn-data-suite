import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportMissingDataComponent } from './db-support-missing-data.component';

describe('DbSupportMissingDataComponent', () => {
  let component: DbSupportMissingDataComponent;
  let fixture: ComponentFixture<DbSupportMissingDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportMissingDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportMissingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
