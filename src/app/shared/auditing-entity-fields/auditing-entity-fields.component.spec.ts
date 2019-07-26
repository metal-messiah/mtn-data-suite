import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditingEntityFieldsComponent } from './auditing-entity-fields.component';

describe('AuditingEntityFieldsComponent', () => {
  let component: AuditingEntityFieldsComponent;
  let fixture: ComponentFixture<AuditingEntityFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditingEntityFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditingEntityFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
