import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStoreVolumeComponent } from './new-store-volume.component';

describe('NewStoreVolumeComponent', () => {
  let component: NewStoreVolumeComponent;
  let fixture: ComponentFixture<NewStoreVolumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewStoreVolumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStoreVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
