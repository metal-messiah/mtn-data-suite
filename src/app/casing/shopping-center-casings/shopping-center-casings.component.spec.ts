import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCenterCasingsComponent } from './shopping-center-casings.component';

describe('ShoppingCenterCasingsComponent', () => {
  let component: ShoppingCenterCasingsComponent;
  let fixture: ComponentFixture<ShoppingCenterCasingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingCenterCasingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCenterCasingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
