import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/Auth/auth.service';
import { lastValueFrom } from 'rxjs';

export const noVerificationGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const localUser = JSON.parse(localStorage.getItem('userLogin')!);

  // Mantenemos exactamente la misma condición original como fallback
  if (!localUser?.email_verified_at && localUser?.token && !authService.getEmailVerified) {
    try {
      // Solo hacemos la llamada a la API si el email no está verificado localmente
      const profileResponse = await lastValueFrom(authService.userProfile());
      const apiEmailVerified = (profileResponse as any)?.data?.email_verified;

      // Si la API dice que SÍ está verificado, actualizamos el estado local
      if (apiEmailVerified === true) {
        const updatedUser = {
          ...localUser,
          email_verified_at: new Date().toISOString() // o usar el valor de la API si lo tiene
        };
        localStorage.setItem('userLogin', JSON.stringify(updatedUser));
        authService.setEmailVerified(true);
        return true; // Permitir acceso
      }

      // Si la API confirma que NO está verificado, redirigir
      router.navigate(['/no-verification']);
      return false;
    } catch (error) {
      console.error('Error al verificar perfil:', error);
      // Si falla la API, mantener el comportamiento original
      router.navigate(['/no-verification']);
      return false;
    }
  }

  return true; // Permitir acceso si ya está verificado localmente
};