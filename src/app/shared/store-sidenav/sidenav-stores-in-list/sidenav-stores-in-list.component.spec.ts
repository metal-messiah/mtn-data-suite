import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavStoresInListComponent } from './sidenav-stores-in-list.component';

describe('SidenavStoresInListComponent', () => {
  let component: SidenavStoresInListComponent;
  let fixture: ComponentFixture<SidenavStoresInListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavStoresInListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavStoresInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
