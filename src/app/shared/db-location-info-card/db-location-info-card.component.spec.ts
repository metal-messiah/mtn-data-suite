import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbLocationInfoCardComponent } from './db-location-info-card.component';

describe('StoreInfoCardComponent', () => {
  let component: DbLocationInfoCardComponent;
  let fixture: ComponentFixture<DbLocationInfoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbLocationInfoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbLocationInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
