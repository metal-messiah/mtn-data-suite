import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainXyComponent } from './chain-xy.component';

describe('ChainXyComponent', () => {
  let component: ChainXyComponent;
  let fixture: ComponentFixture<ChainXyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainXyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainXyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
