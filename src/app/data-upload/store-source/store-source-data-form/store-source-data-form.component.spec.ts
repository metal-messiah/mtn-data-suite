import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSourceDataFormComponent } from './store-source-data-form.component';

describe('StoreSourceDataFormComponent', () => {
  let component: StoreSourceDataFormComponent;
  let fixture: ComponentFixture<StoreSourceDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSourceDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreSourceDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
