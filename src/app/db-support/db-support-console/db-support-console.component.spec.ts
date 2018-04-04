import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportConsoleComponent } from './db-support-console.component';

describe('DbSupportConsoleComponent', () => {
  let component: DbSupportConsoleComponent;
  let fixture: ComponentFixture<DbSupportConsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbSupportConsoleComponent ]
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
