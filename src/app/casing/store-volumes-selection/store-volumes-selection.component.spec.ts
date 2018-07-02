import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreVolumesSelectionComponent } from './store-volumes-selection.component';

describe('StoreVolumesSelectionComponent', () => {
  let component: StoreVolumesSelectionComponent;
  let fixture: ComponentFixture<StoreVolumesSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreVolumesSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreVolumesSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
