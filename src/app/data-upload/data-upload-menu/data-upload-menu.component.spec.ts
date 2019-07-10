import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUploadMenuComponent } from './data-upload-menu.component';

describe('OptionsMenuComponent', () => {
  let component: DataUploadMenuComponent;
  let fixture: ComponentFixture<DataUploadMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataUploadMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataUploadMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
