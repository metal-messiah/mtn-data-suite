import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExtractionComponent } from './project-extraction.component';

describe('ProjectExtractionComponent', () => {
  let component: ProjectExtractionComponent;
  let fixture: ComponentFixture<ProjectExtractionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectExtractionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectExtractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
