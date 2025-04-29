import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/Auth/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-forgot-password',
  imports: [CommonModule, FormsModule, Dialog, ButtonModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  public visible2:boolean = true;
  public formForgotPassword!:FormGroup;
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private readonly router = inject(Router);

  @Output() visibleModalForgotPassword = new EventEmitter<boolean>();

  constructor(){
    this.formForgotPassword = this.formBuilder.group({
      email : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")] )
    })
  }

  onDialogHide() {
    this.visible2 = false;
    this.visibleModalForgotPassword.emit(false);
  }

  // Recuperación de contraseña

  forgotPassword():void{
    if (this.formForgotPassword.invalid) {
      this.formForgotPassword.markAllAsTouched(); return;  
    }

    this.onDialogHide();
    this.authService.forgotPassword(this.formForgotPassword.value).subscribe({
      next: (s) => {
        Swal.fire({
          title: "Aviso",
          text: "¡Verificación enviada exitosamente a su correo electrónico! 😎🥳",
          icon: "success",
          customClass: {
            popup: 'custom-swal-dark'  
          }
        });
      },
      error: (err) => {
        Swal.fire({
          title: "Aviso",
          text: err.statusText,
          icon: "error",
          customClass: {
            popup: 'custom-swal-dark'  
          }
        });

      }
    })
  }


}
