import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCasingsComponent } from './store-casings.component';

describe('StoreCasingsComponent', () => {
  let component: StoreCasingsComponent;
  let fixture: ComponentFixture<StoreCasingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreCasingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCasingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
