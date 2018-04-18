import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatLngSearchComponent } from './lat-lng-search.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LatLngSearchComponent', () => {
  let component: LatLngSearchComponent;
  let fixture: ComponentFixture<LatLngSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ],
      declarations: [ LatLngSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatLngSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
