import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingVolumeComponent } from './casing-volume.component';

describe('CasingVolumeComponent', () => {
  let component: CasingVolumeComponent;
  let fixture: ComponentFixture<CasingVolumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasingVolumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasingVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
