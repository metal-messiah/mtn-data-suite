import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedGroceryComponent } from './planned-grocery.component';

describe('PlannedGroceryComponent', () => {
  let component: PlannedGroceryComponent;
  let fixture: ComponentFixture<PlannedGroceryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlannedGroceryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannedGroceryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
