import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingProjectsComponent } from './casing-projects.component';

describe('CasingProjectsComponent', () => {
  let component: CasingProjectsComponent;
  let fixture: ComponentFixture<CasingProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasingProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasingProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
