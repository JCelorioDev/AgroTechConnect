import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { AlertService } from '../../alerts/alert.service';
import { Router } from '@angular/router';
import { AuthServiceUser } from '../../../auth/services/auth/authServiceUser.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { isPlatformBrowser } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import Swal from 'sweetalert2';

@Component({
  selector: 'no-verification',
  imports: [ButtonModule, ToolbarModule, LottieComponent],
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
  public loading:boolean = false;

  lottieOptions: AnimationOptions = {
    path: 'anim/verifyemail_anim.json',
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object){

  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
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
    this.router.navigate(['menu/publicaciones']);
  }

  

  logout(): void {
    this.isLoggingOut = true;


  
    this.alertService.alertwithDialogs(
      '¿Estás seguro de cerrar sesión?',
      'Después no podrás revertir esta acción',
      'info',
      3000,
      () => {
        this.loading = true;
        this.authService.logout().subscribe({
          next: () => {
            const Toast = Swal.mixin({
              toast: true,
              position: "bottom-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            this.router.navigate(['menu/publicaciones']);
            Toast.fire({
              icon: "success",
              title: "Se cerró la sesión correctamente"
            });
            localStorage.removeItem('userLogin');
            this.loading = false;
          },
          error: (err) => {
            this.router.navigate(['menu/publicaciones']);
            this.alertService.miniAlert(err.error.mensaje, 'error', 2500);
            localStorage.clear();
            this.loading = false;
          }
        });
      },
      'No, deseo',
      'Sí, deseo'
    );
  }
  

  
  sendEmailVerification():void{
    this.loading = true;
    this.autenticationService.sendEmailVerification().subscribe({
      next: (s) => {
        this.alertService.miniAlert('Se envio de nuevo la verificación de correo, revise el buzón de correos.', 'info', 2500);
        this.loading = false;
      }, 
      error: (err) => {
        this.alertService.miniAlert(err.error.message, 'error', 3000);
        this.loading = false;
      }
    })
  }

  toggleDarkMode() {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.querySelector('html');
      if (element !== null) {
        localStorage.setItem('themeDark', 'true');
        element.classList.toggle('custom-dark-mode');
      }
    }
  }
}
