import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { passwordMatchValidator } from '../../../core/validation/password repeat/passwordMatchValidator';
import { AuthService } from '../../../core/services/Auth/auth.service';
import Swal from 'sweetalert2';
import { AlertService } from '../../../shared/alerts/alert.service';
import { PasswordModule } from 'primeng/password';
import { AuthServiceUser } from '../../services/auth/authServiceUser.service';


@Component({
  selector: 'auth-register',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Dialog, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  public visible: boolean = true;
  public formRegister!:FormGroup;
  private formBuilder = inject(FormBuilder);
  @Output() visibleModalRegister = new EventEmitter<boolean>();
  private readonly authService = inject(AuthService);
  public readonly authenticationService = inject(AuthServiceUser);
  private readonly alertSevice = inject(AlertService);
  public isLoadingRegister:boolean = false;

  constructor(){
    this.formRegister = this.formBuilder.group({
      name : new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),

      lastname : new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      username : new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]),
      email : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
      password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,15}$/)]),
      password_confirmation : new FormControl('', [Validators.required])
    },
    {
      validators: passwordMatchValidator('password', 'password_confirmation')
    }
    )
  }

  ngOnInit():void{
    this.visible = true;
  }


  onDialogHide() {
    this.visible = false;
    this.visibleModalRegister.emit(false);
  }


  // Registro de usuario (Email/Contraseña)

  registerwithEmailandPassword(){
    if (this.formRegister.invalid) {
      this.alertSevice.miniAlert('Campos vacíos o inválidos.', 'info', 2500);
      this.formRegister.markAllAsTouched(); return ;
    }

    this.isLoadingRegister = true;

    this.authService.registerwithEmailandPassword(this.formRegister.value).subscribe({
      next: (s) => {
        this.onDialogHide();
        localStorage.setItem('tokenVerificationEmail', s.data.token);
        this.isLoadingRegister = false;
        this.alertSevice.miniAlert('Registro exitoso', 'success', 2500);
        this.alertSevice.miniAlert('Verifica tu correo electrónico, revisa la bandeja de correo.', 'warning', 3000);
      },
      error: (err:any) => {
        this.isLoadingRegister = false;

        if (err.status === 422) {
          this.alertSevice.showValidationErrors(err.error);
        }else{
          this.alertSevice.miniAlert(err.error.message, 'error', 3000);
        }

      }
    })
  }

  // Métodos para verificar cada requisito de contraseña
   get password() {
    return this.formRegister.get('password') as FormControl;
  }

  get lengthValid() {
    const value = this.password.value || '';
    return value.length >= 8 && value.length <= 15;
  }

  get hasUpperCase() {
    return /[A-Z]/.test(this.password.value || '');
  }

  get hasNumber() {
    return /[0-9]/.test(this.password.value || '');
  }

  get hasSpecialChar() {
    return /[@$!%*?&]/.test(this.password.value || '');
  }


  // Enviar correo de verificacion 

  sendEmailVerification():void{
    this.isLoadingRegister = true;
    this.authenticationService.sendEmailVerification().subscribe({
      next: (s) => {
        this.alertSevice.miniAlert('Se envio de nuevo la verificación de correo, revise el buzón de correos.', 'info', 2500);
        this.isLoadingRegister = false;
      }, 
      error: (err) => {
        this.alertSevice.miniAlert(err.error.message, 'error', 3000);
        this.isLoadingRegister = false;
      }
    })
  }

  
}
