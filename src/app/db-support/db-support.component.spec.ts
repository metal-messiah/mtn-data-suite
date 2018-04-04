import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportComponent } from './db-support.component';

describe('DbSupportComponent', () => {
  let component: DbSupportComponent;
  let fixture: ComponentFixture<DbSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportComponent ]
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
