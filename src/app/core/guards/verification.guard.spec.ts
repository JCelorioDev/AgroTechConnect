import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { verificationGuard } from './verification.guard';

describe('verificationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => verificationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
