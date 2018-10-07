import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteInfoCardComponent } from './site-info-card.component';

describe('SiteInfoCardComponent', () => {
  let component: SiteInfoCardComponent;
  let fixture: ComponentFixture<SiteInfoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteInfoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
