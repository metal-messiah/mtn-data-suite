import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSourceDataFieldComponent } from './store-source-data-field.component';

describe('StoreSourceDataFieldComponent', () => {
  let component: StoreSourceDataFieldComponent;
  let fixture: ComponentFixture<StoreSourceDataFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSourceDataFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSourceDataFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
