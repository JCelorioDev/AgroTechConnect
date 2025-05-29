import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

let hasRedirected = false; // fuera del guard

export const verificationGuard: CanActivateFn = (route, state) => {
  const userLogin = JSON.parse(localStorage.getItem('userLogin')!);
  const authService = inject(AuthService);
  const router = inject(Router);

  const emailVerified = userLogin?.email_verified_at !== null || authService.getEmailVerified;

  if (!userLogin || emailVerified) {
    if (!hasRedirected) {
      hasRedirected = true;
      router.navigate(['menu/publicaciones']);
    }
    return false;
  }

  hasRedirected = false; 
  return true;
};

