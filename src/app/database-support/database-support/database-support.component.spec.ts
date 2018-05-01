import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseSupportComponent } from './database-support.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared/shared.module';

describe('DatabaseSupportComponent', () => {
  let component: DatabaseSupportComponent;
  let fixture: ComponentFixture<DatabaseSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, RouterTestingModule ],
      declarations: [DatabaseSupportComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
