import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProjectComponent } from './select-project.component';
import { CasingModule } from '../casing.module';
import { SharedModule } from '../../shared/shared.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from '../../core/services/project.service';
import { of } from 'rxjs/observable/of';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SelectProjectComponent', () => {
  let component: SelectProjectComponent;
  let fixture: ComponentFixture<SelectProjectComponent>;

  beforeEach(async(() => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getAll', 'getAllByQuery']);
    projectServiceSpy.getAll.and.returnValue(of({content: []}));
    projectServiceSpy.getAllByQuery.and.returnValue(of({content: []}));

    TestBed.configureTestingModule({
      imports: [ CasingModule, BrowserAnimationsModule, SharedModule ],
      providers: [
        {provide: ProjectService, useValue: projectServiceSpy},
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
