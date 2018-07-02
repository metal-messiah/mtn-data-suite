import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantListDialogComponent } from './tenant-list-dialog.component';

describe('TenantListDialogComponent', () => {
  let component: TenantListDialogComponent;
  let fixture: ComponentFixture<TenantListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
