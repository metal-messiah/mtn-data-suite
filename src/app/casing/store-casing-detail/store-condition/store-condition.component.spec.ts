import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreConditionComponent } from './store-condition.component';

describe('StoreConditionComponent', () => {
  let component: StoreConditionComponent;
  let fixture: ComponentFixture<StoreConditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
