import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { noVerificationGuard } from './no-verification.guard';

describe('noVerificationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => noVerificationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
