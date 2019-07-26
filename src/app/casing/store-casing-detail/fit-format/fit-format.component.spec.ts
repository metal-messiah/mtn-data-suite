import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FitFormatComponent } from './fit-format.component';

describe('FitFormatComponent', () => {
  let component: FitFormatComponent;
  let fixture: ComponentFixture<FitFormatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FitFormatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
