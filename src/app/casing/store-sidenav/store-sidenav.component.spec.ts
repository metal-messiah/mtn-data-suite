import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSidenavComponent } from './store-sidenav.component';

describe('StoreSidenavComponent', () => {
  let component: StoreSidenavComponent;
  let fixture: ComponentFixture<StoreSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
