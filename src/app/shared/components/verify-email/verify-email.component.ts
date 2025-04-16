import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent {
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
    // Obtener todos los query parameters
    const queryParams = this.route.snapshot.queryParams;
    
    console.log('Parámetros recibidos:', queryParams); // Para depuración

    const { id, hash, expires, signature } = queryParams;

    if (!id || !hash || !expires || !signature) {
      console.error('Parámetros faltantes:', { id, hash, expires, signature });
      this.router.navigate(['/error'], { 
        queryParams: { error: 'missing_parameters' } 
      });
      return;
    }

    this.authService.verificationEmail(id, hash, expires, signature).subscribe({
      next: () => {
        this.router.navigate(['/verification-success']);
      },
      error: (err) => {
        console.error('Error en verificación:', err);
        this.router.navigate(['/error'], { 
          queryParams: { error: 'verification_failed' } 
        });
      }
    });
  }
}
