import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbEntityControlsComponent } from './db-entity-controls.component';

describe('DbEntityControlsComponent', () => {
  let component: DbEntityControlsComponent;
  let fixture: ComponentFixture<DbEntityControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbEntityControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbEntityControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
