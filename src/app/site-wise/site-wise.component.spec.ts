import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteWiseComponent } from './site-wise.component';

describe('SiteWiseComponent', () => {
  let component: SiteWiseComponent;
  let fixture: ComponentFixture<SiteWiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteWiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
