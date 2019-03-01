import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSelectDialogComponent } from './tab-select-dialog.component';

describe('TabSelectDialogComponent', () => {
  let component: TabSelectDialogComponent;
  let fixture: ComponentFixture<TabSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
