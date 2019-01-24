import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainXyTableComponent } from './chain-xy-table.component';

describe('ChainXyTableComponent', () => {
  let component: ChainXyTableComponent;
  let fixture: ComponentFixture<ChainXyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainXyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainXyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
