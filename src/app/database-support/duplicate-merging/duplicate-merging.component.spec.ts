import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateMergingComponent } from './duplicate-merging.component';

describe('DuplicateMergingComponent', () => {
  let component: DuplicateMergingComponent;
  let fixture: ComponentFixture<DuplicateMergingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateMergingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateMergingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
