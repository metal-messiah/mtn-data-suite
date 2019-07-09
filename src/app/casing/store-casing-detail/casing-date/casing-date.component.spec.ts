import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingDateComponent } from './casing-date.component';

describe('CasingDateComponent', () => {
  let component: CasingDateComponent;
  let fixture: ComponentFixture<CasingDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasingDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasingDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
