import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreInfoCardComponent } from './store-info-card.component';

describe('StoreInfoCardComponent', () => {
  let component: StoreInfoCardComponent;
  let fixture: ComponentFixture<StoreInfoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreInfoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
