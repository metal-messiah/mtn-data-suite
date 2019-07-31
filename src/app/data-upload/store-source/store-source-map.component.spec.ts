import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSourceMapComponent } from './store-source-map.component';

describe('StoreSourceMapComponent', () => {
  let component: StoreSourceMapComponent;
  let fixture: ComponentFixture<StoreSourceMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSourceMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSourceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
