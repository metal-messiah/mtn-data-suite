import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainXyMapComponent } from './chain-xy-map.component';

describe('ChainXyMapComponent', () => {
  let component: ChainXyMapComponent;
  let fixture: ComponentFixture<ChainXyMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainXyMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainXyMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
