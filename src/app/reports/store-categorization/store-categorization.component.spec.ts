import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCategorizationComponent } from './store-categorization.component';

describe('StoreCategorizationComponent', () => {
  let component: StoreCategorizationComponent;
  let fixture: ComponentFixture<StoreCategorizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreCategorizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCategorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
