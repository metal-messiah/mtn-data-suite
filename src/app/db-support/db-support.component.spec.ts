import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSupportComponent } from './db-support.component';
import { DbSupportModule } from './db-support.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('DbSupportComponent', () => {
  let component: DbSupportComponent;
  let fixture: ComponentFixture<DbSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DbSupportModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
