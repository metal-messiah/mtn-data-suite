import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HarrisTeeterComponent } from './harris-teeter.component';

describe('HarrisTeeterComponent', () => {
  let component: HarrisTeeterComponent;
  let fixture: ComponentFixture<HarrisTeeterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HarrisTeeterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HarrisTeeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
