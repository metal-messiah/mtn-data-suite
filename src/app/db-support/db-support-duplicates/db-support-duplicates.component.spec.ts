import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportDuplicatesComponent } from './db-support-duplicates.component';

describe('DbSupportDuplicatesComponent', () => {
  let component: DbSupportDuplicatesComponent;
  let fixture: ComponentFixture<DbSupportDuplicatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportDuplicatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportDuplicatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
