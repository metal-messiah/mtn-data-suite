import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSummaryCardComponent } from './store-summary-card.component';

describe('StoreSummaryCardComponent', () => {
  let component: StoreSummaryCardComponent;
  let fixture: ComponentFixture<StoreSummaryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSummaryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
