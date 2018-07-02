import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCenterSurveyFormComponent } from './shopping-center-survey-form.component';

describe('ShoppingCenterSurveyFormComponent', () => {
  let component: ShoppingCenterSurveyFormComponent;
  let fixture: ComponentFixture<ShoppingCenterSurveyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingCenterSurveyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCenterSurveyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
