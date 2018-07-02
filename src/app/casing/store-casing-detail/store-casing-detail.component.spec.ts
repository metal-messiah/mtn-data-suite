import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCasingDetailComponent } from './store-casing-detail.component';

describe('StoreCasingDetailComponent', () => {
  let component: StoreCasingDetailComponent;
  let fixture: ComponentFixture<StoreCasingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreCasingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCasingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
