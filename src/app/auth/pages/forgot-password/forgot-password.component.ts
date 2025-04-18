import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/Auth/auth.service';
import Swal from 'sweetalert2';

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
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: true,
          confirmButtonText: "OK",
          timer: 1500,
          customClass: {
            popup: 'custom-dark-mode',
            confirmButton: 'btn-confirm' 
          },
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        
        Toast.fire({
          icon: "success",
          title: "Verificación enviada exitosamente a su correo electrónico."
        }).then((result) => {
          if (result.isConfirmed) {
            this.visible2 = false;
          }
        });   
      },
      error: (err) => {
        
      }
    })
  }


}
