import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBannerComponent } from './select-banner.component';

describe('SelectBannerComponent', () => {
  let component: SelectBannerComponent;
  let fixture: ComponentFixture<SelectBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
