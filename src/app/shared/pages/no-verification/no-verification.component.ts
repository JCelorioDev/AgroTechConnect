import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { AlertService } from '../../alerts/alert.service';
import { Router } from '@angular/router';
import { AuthServiceUser } from '../../../auth/services/auth/authServiceUser.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'no-verification',
  imports: [ButtonModule, ToolbarModule],
  standalone: true,
  templateUrl: './no-verification.component.html',
  styleUrl: './no-verification.component.scss'
})
export class NoVerificationComponent {
  private previousState: string | null = null;
  private isLoggingOut = false; // ← Bandera para evitar falsos positivos

  private readonly authService = inject(AuthService);
  private readonly autenticationService = inject(AuthServiceUser);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object){
    
  }

  ngOnInit(): void {
    this.startWatchingUserLogin();
  }

  startWatchingUserLogin(): void {
    setInterval(() => {
      const current = localStorage.getItem('userLogin');
      if (this.previousState && current !== this.previousState) {
        if (!this.isLoggingOut) { // ← Solo si no es cierre de sesión válido
          console.warn('⚠️ userLogin ha sido modificado o alterado.');
          this.handleSuspiciousChange();
        }
      }
      this.previousState = current;
    }, 1000);
  }

  handleSuspiciousChange(): void {
    alert('Tu sesión fue alterada. Se cerrará por seguridad.');
    localStorage.removeItem('userLogin');
    window.location.href = 'menu/publicaciones'; 
  }

  

  logout(): void {
    this.isLoggingOut = true;
  
    this.alertService.alertwithDialogs(
      '¿Estás seguro de cerrar sesión?',
      'Después no podrás revertir esta acción',
      'info',
      3000,
      () => {
        this.authService.logout().subscribe({
          next: () => {
            this.alertService.miniAlert('La sesión se cerró correctamente.', 'success', 2500);
            this.router.navigate(['menu/publicaciones']);
            this.toggleDarkMode();
            localStorage.clear();
          },
          error: (err) => {
            this.router.navigate(['menu/publicaciones']);
            this.toggleDarkMode();
            this.alertService.miniAlert(err.error.mensaje, 'error', 2500);
            localStorage.clear();
          }
        });
      },
      'No, deseo',
      'Sí, deseo'
    );
  }
  

  
  sendEmailVerification():void{
    this.autenticationService.sendEmailVerification().subscribe({
      next: (s) => {
        this.alertService.miniAlert('Se envio de nuevo la verificación de correo, revise el buzón de correos.', 'info', 2500);
      }, 
      error: (err) => {
        this.alertService.miniAlert(err.error.message, 'error', 3000);
      }
    })
  }

  toggleDarkMode() {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.querySelector('html');
      if (element !== null) {
        element.classList.toggle('custom-dark-mode');
      }
    }
  }
}
