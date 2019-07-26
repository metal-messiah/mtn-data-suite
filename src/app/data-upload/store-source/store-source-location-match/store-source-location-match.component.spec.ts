import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSourceLocationMatchComponent } from './store-source-location-match.component';

describe('StoreSourceLocationMatchComponent', () => {
  let component: StoreSourceLocationMatchComponent;
  let fixture: ComponentFixture<StoreSourceLocationMatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSourceLocationMatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSourceLocationMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
