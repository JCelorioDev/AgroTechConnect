import { TestBed } from '@angular/core/testing';

import { RolsService } from './rols.service';

describe('RolsService', () => {
  let service: RolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
