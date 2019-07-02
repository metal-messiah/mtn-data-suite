import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavStoresOnMapComponent } from './sidenav-stores-on-map.component';

describe('SitenavStoresOnMapComponent', () => {
  let component: SidenavStoresOnMapComponent;
  let fixture: ComponentFixture<SidenavStoresOnMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavStoresOnMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavStoresOnMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
