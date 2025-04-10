import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/Auth/auth.service';

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
    this.authService.forgotPassword(this.formForgotPassword.value).subscribe({
      next: (s) => {
        console.log(s)
      },
      error: (err) => {
        
      }
    })
  }


}
