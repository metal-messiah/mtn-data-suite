import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatLngSearchComponent } from './lat-lng-search.component';

describe('LatLngSearchComponent', () => {
  let component: LatLngSearchComponent;
  let fixture: ComponentFixture<LatLngSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatLngSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatLngSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
