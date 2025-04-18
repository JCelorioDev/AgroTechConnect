import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-verify-email',
  imports: [LottieComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent {
  options: AnimationOptions = {
    path: 'anim/verifyemail_anim.json',
  };

  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verifyEmail();
  }

  private verifyEmail(): void {
    const queryParams = this.route.snapshot.queryParams;
    const { id, hash, expires, signature } = queryParams;

    if (!id || !hash || !expires || !signature) {
      Swal.fire({
        title: "Aviso",
        text: "Parámetros faltantes para la verificación de correo.",
        icon: "warning",
        customClass: {
          popup: 'custom-swal-dark'  
        }
      });

      this.router.navigate(['menu/publicaciones'])
    }

    this.authService.verificationEmail(id, hash, expires, signature).subscribe({
      next: () => {
        this.router.navigate(['menu/publicaciones']);
        this.authService.setEmailVerified(true);
        localStorage.removeItem('tokenVerificationEmail');
      },
      error: (err) => {
          Swal.fire({
            title: "Aviso",
            text: err.statusText,
            icon: "warning",
            customClass: {
              popup: 'custom-swal-dark'  
            }
          });

        this.router.navigate(['menu/publicaciones'])
      }
    });
  }

  styles: Partial<CSSStyleDeclaration> = {
    maxWidth: '500px',
    margin: '0 auto',
  };
}
