import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { passwordMatchValidator } from '../../../core/validation/password repeat/passwordMatchValidator';
import { AuthService } from '../../../core/services/Auth/auth.service';
import Swal from 'sweetalert2';
import { AlertService } from '../../../shared/alerts/alert.service';

@Component({
  selector: 'app-password-recovery',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ReactiveFormsModule, RouterLink],
  standalone: true,
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.scss'
})
export class PasswordRecoveryComponent {


  token: string = '';
  email: string = '';

  public formPasswordReset!:FormGroup;
  private readonly route = inject(ActivatedRoute);
  private readonly formbuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);

  
  constructor() { 
    this.formPasswordReset = this.formbuilder.group({
      password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)]),
      password_confirmation : new FormControl('', [Validators.required])
    }, {
      validators: passwordMatchValidator('password', 'password_confirmation')
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Obtener el token
      this.token = params['token'] || '';
      
      // Obtener el email y decodificar el %40 como @
      const emailParam = params['email'] || '';
      this.email = decodeURIComponent(emailParam);
    });
  }

  // Resetear las contraseña

  reset_password():void{
    if (this.formPasswordReset.invalid) {
      this.formPasswordReset.markAllAsTouched(); return ;
    }

    let requestData = {
      token : this.token,
      email : this.email,
      password : this.formPasswordReset.value['password'],
      password_confirmation : this.formPasswordReset.value['password_confirmation']
    }

  
    this.authService.resetPassword(requestData).subscribe({
      next: (s) => {
        this.router.navigate(['menu/publicaciones']);
        this.authService.setstatusPassword(true);
      },
      error: (err) => {
        this.alertService.miniAlert(err.error.message, 'warning', 2500);
      }
    })
  }

}
