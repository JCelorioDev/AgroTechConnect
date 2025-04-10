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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  isVerified = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      const hash = params['hash'];
    
      this.route.queryParams.subscribe(qParams => {
        const expires = qParams['expires'];
        const signature = qParams['signature'];
    
        this.authService.verificationEmail(id, hash, expires, signature).subscribe({
          next: (res) => {
            this.authService.setEmailVerified(true);
            this.isVerified = true;
            this.router.navigate(['/menu/publicaciones'], {
              queryParams: { verified: true }
            });
          },
          error: (err) => {
            this.authService.setEmailVerified(false);
            this.isVerified = false;
            this.router.navigate(['/menu/publicaciones'], {
              queryParams: { verified: false }
            });
          }
        });
      });
    });

  }
  
}
