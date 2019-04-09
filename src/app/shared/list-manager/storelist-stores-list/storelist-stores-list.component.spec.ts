import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorelistStoresListComponent } from './storelist-stores-list.component';

describe('StorelistStoresListComponent', () => {
  let component: StorelistStoresListComponent;
  let fixture: ComponentFixture<StorelistStoresListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorelistStoresListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorelistStoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
