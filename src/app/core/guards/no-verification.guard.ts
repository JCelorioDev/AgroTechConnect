import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const noVerificationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const emailVerified = JSON.parse(localStorage.getItem('userLogin')!); 

  if (!emailVerified?.email_verified_at && emailVerified?.token) {
    router.navigate(['/no-verification']); 
    return false;
  } 

  return true;
};