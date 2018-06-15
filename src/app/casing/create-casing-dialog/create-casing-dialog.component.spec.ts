import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCasingDialogComponent } from './create-casing-dialog.component';

describe('CreateCasingDialogComponent', () => {
  let component: CreateCasingDialogComponent;
  let fixture: ComponentFixture<CreateCasingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCasingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCasingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
