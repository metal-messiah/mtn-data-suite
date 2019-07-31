import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreParkingComponent } from './store-parking.component';

describe('StoreParkingComponent', () => {
  let component: StoreParkingComponent;
  let fixture: ComponentFixture<StoreParkingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreParkingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreParkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
