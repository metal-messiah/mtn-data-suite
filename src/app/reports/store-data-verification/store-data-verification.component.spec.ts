import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDataVerificationComponent } from './store-data-verification.component';

describe('StoreDataVerificationComponent', () => {
  let component: StoreDataVerificationComponent;
  let fixture: ComponentFixture<StoreDataVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreDataVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreDataVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
