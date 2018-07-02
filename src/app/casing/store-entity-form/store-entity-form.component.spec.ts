import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreEntityFormComponent } from './store-entity-form.component';

describe('StoreEntityFormComponent', () => {
  let component: StoreEntityFormComponent;
  let fixture: ComponentFixture<StoreEntityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreEntityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreEntityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
