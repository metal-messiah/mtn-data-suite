import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseSupportComponent } from './database-support.component';
import { DuplicateService } from '../../core/services/duplicate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared/shared.module';
import { of } from 'rxjs/observable/of';

describe('DatabaseSupportComponent', () => {
  let component: DatabaseSupportComponent;
  let fixture: ComponentFixture<DatabaseSupportComponent>;

  beforeEach(async(() => {
    const duplicateServiceSpy = jasmine.createSpyObj('DuplicateService', ['getAll']);
    duplicateServiceSpy.getAll.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [ SharedModule, RouterTestingModule ],
      declarations: [DatabaseSupportComponent],
      providers: [
        {provide: DuplicateService, useValue: duplicateServiceSpy}
      ]
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
