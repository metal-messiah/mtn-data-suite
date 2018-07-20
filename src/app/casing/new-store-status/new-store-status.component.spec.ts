import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStoreStatusComponent } from './new-store-status.component';

describe('NewStoreStatusComponent', () => {
  let component: NewStoreStatusComponent;
  let fixture: ComponentFixture<NewStoreStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewStoreStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStoreStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
