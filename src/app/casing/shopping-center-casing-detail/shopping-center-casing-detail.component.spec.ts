import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCenterCasingDetailComponent } from './shopping-center-casing-detail.component';

describe('ShoppingCenterCasingDetailComponent', () => {
  let component: ShoppingCenterCasingDetailComponent;
  let fixture: ComponentFixture<ShoppingCenterCasingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingCenterCasingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCenterCasingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
