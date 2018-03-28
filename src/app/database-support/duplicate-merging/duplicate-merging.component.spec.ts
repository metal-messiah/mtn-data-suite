import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs/observable/of';
import { SharedModule } from '../../shared/shared.module';
import { DuplicateMergingComponent } from './duplicate-merging.component';
import { DuplicateService } from '../../core/services/duplicate.service';

describe('DuplicateMergingComponent', () => {
  let component: DuplicateMergingComponent;
  let fixture: ComponentFixture<DuplicateMergingComponent>;

  beforeEach(async(() => {
    const duplicateServiceSpy = jasmine.createSpyObj('DuplicateService', ['getAll']);
    duplicateServiceSpy.getAll.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [ SharedModule, RouterTestingModule ],
      declarations: [DuplicateMergingComponent],
      providers: [
        {provide: DuplicateService, useValue: duplicateServiceSpy}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateMergingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
