import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/Auth/auth.service';


export const noVerificationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const emailVerified = JSON.parse(localStorage.getItem('userLogin')!); 

  if (!emailVerified?.email_verified_at && emailVerified?.token && !authService.getEmailVerified) {
    router.navigate(['/no-verification']); 
    return false;
  } 

  return true;
};