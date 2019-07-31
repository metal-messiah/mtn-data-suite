import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingNotesComponent } from './casing-notes.component';

describe('CasingNotesComponent', () => {
  let component: CasingNotesComponent;
  let fixture: ComponentFixture<CasingNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasingNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasingNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
