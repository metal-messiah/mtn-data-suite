import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTitleBarComponent } from './sub-title-bar.component';

describe('SubTitleBarComponent', () => {
  let component: SubTitleBarComponent;
  let fixture: ComponentFixture<SubTitleBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubTitleBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTitleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
