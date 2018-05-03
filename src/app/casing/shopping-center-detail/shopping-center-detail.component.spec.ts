import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCenterDetailComponent } from './shopping-center-detail.component';

describe('ShoppingCenterDetailComponent', () => {
  let component: ShoppingCenterDetailComponent;
  let fixture: ComponentFixture<ShoppingCenterDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingCenterDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCenterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
