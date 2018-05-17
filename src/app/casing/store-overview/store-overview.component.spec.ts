import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreOverviewComponent } from './store-overview.component';

describe('StoreOverviewComponent', () => {
  let component: StoreOverviewComponent;
  let fixture: ComponentFixture<StoreOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
