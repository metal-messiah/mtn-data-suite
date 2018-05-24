import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStatusSelectComponent } from './store-status-select.component';

describe('StoreStatusSelectComponent', () => {
  let component: StoreStatusSelectComponent;
  let fixture: ComponentFixture<StoreStatusSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreStatusSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreStatusSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
