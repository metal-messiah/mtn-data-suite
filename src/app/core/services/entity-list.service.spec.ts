import { TestBed, inject } from '@angular/core/testing';

import { EntityListService } from './entity-list.service';
import { AdministrationModule } from '../../administration/administration.module';
import { SharedModule } from '../../shared/shared.module';
import { ErrorService } from './error.service';

describe('EntityListService', () => {
  const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleServerError']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ],
      providers: [
        EntityListService,
        {provide: ErrorService, useValue: errorServiceSpy}
      ]
    });
  });

  it('should be created', inject([EntityListService], (service: EntityListService<any>) => {
    expect(service).toBeTruthy();
  }));
});
