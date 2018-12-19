import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreMergeDialog2Component } from './store-merge-dialog2.component';

describe('StoreMergeDialog2Component', () => {
  let component: StoreMergeDialog2Component;
  let fixture: ComponentFixture<StoreMergeDialog2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreMergeDialog2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreMergeDialog2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
