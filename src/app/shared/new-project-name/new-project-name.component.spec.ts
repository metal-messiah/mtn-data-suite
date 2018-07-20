import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProjectNameComponent } from './new-project-name.component';

describe('NewProjectNameComponent', () => {
  let component: NewProjectNameComponent;
  let fixture: ComponentFixture<NewProjectNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewProjectNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewProjectNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
