import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavUserListsComponent } from './sidenav-user-lists.component';

describe('SitenavUserListsComponent', () => {
  let component: SidenavUserListsComponent;
  let fixture: ComponentFixture<SidenavUserListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavUserListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavUserListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
