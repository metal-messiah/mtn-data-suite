import { TestBed, inject } from '@angular/core/testing';

import { JsonToTablesService } from './json-to-tables.service';

describe('JsonToTablesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonToTablesService]
    });
  });

  it('should be created', inject([JsonToTablesService], (service: JsonToTablesService) => {
    expect(service).toBeTruthy();
  }));
});
