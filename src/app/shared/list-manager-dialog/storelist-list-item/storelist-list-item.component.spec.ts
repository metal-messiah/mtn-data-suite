import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorelistListItemComponent } from './storelist-list-item.component';

describe('StorelistListItemComponent', () => {
  let component: StorelistListItemComponent;
  let fixture: ComponentFixture<StorelistListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorelistListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorelistListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
