import { TestBed } from '@angular/core/testing';

import { LoginSocialnetworksService } from './login-socialnetworks.service';

describe('LoginSocialnetworksService', () => {
  let service: LoginSocialnetworksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginSocialnetworksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
