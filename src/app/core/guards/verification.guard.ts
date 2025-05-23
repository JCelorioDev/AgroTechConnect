import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const verificationGuard: CanActivateFn = (route, state) => {
  const userLogin = JSON.parse(localStorage.getItem('userLogin')!);
  const router = inject(Router);

  if (!userLogin) {
    router.navigate(['menu/publicaciones'])
    return false;
  }
  return true;
};
