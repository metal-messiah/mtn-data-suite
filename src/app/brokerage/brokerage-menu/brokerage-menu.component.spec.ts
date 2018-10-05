import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerageMenuComponent } from './brokerage-menu.component';

describe('BrokerageMenuComponent', () => {
  let component: BrokerageMenuComponent;
  let fixture: ComponentFixture<BrokerageMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokerageMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokerageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
