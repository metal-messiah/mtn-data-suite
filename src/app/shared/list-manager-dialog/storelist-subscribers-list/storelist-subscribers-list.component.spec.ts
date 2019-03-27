import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorelistSubscribersListComponent } from './storelist-subscribers-list.component';

describe('StorelistSubscribersListComponent', () => {
  let component: StorelistSubscribersListComponent;
  let fixture: ComponentFixture<StorelistSubscribersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorelistSubscribersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorelistSubscribersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
