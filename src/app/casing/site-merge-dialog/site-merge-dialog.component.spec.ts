import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteMergeDialogComponent } from './site-merge-dialog.component';

describe('SiteMergeDialogComponent', () => {
  let component: SiteMergeDialogComponent;
  let fixture: ComponentFixture<SiteMergeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteMergeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteMergeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
