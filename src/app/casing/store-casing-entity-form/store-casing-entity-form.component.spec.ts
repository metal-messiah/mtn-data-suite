import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCasingEntityFormComponent } from './store-casing-entity-form.component';

describe('StoreCasingEntityFormComponent', () => {
  let component: StoreCasingEntityFormComponent;
  let fixture: ComponentFixture<StoreCasingEntityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreCasingEntityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCasingEntityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
