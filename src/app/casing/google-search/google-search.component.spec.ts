import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSearchComponent } from './google-search.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MapService } from '../../core/services/map.service';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GoogleSearchComponent', () => {
  let component: GoogleSearchComponent;
  let fixture: ComponentFixture<GoogleSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MapService, useValue: {}}
      ],
      declarations: [GoogleSearchComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
