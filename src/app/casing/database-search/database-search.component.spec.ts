import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseSearchComponent } from './database-search.component';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MapService } from '../../core/services/map.service';
import { StoreService } from '../../core/services/store.service';

describe('DatabaseSearchComponent', () => {
  let component: DatabaseSearchComponent;
  let fixture: ComponentFixture<DatabaseSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MapService, useValue: {}},
        {provide: StoreService, useValue: {}}
      ],
      declarations: [ DatabaseSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
