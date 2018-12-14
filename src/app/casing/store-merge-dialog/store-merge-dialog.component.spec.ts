import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreMergeDialogComponent } from './store-merge-dialog.component';

describe('StoreMergeDialogComponent', () => {
  let component: StoreMergeDialogComponent;
  let fixture: ComponentFixture<StoreMergeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreMergeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreMergeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
