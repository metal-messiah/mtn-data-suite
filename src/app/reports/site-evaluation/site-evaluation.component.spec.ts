import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEvaluationComponent } from './site-evaluation.component';

describe('SiteEvaluationComponent', () => {
  let component: SiteEvaluationComponent;
  let fixture: ComponentFixture<SiteEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
