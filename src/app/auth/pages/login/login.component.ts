import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { RegisterComponent } from "../register/register.component";
import { LoginSocialNetwork } from '../../services/authwithSocialNetworks/loginSocialNetwork.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import Swal from 'sweetalert2';
import { AlertService } from '../../../shared/alerts/alert.service';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';


@Component({
  selector: 'auth-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Dialog, ButtonModule, CheckboxModule, InputTextModule, RegisterComponent, ForgotPasswordComponent, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public visible: boolean = true;
  googleChecked: boolean = false;
  facebookChecked: boolean = true;

  public formLogin!:FormGroup;
  private formBuilder = inject(FormBuilder);
  public readonly authService = inject(AuthService);
  private readonly loginSocialNetworks = inject(LoginSocialNetwork);
  private readonly router = inject(Router);
  public isVisibleRegister:boolean = false;
  public isVisiblePasswordForgot:boolean = false;
  public isLoadingLogin:boolean = false;
  private readonly alertService = inject(AlertService);

  @Output() visibleModal = new EventEmitter<boolean>();


  constructor(){
    this.formLogin = this.formBuilder.group({
      email : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
      password : new FormControl('', Validators.required)
    })
  }


  showDialog() {

  }

  ngOnInit():void{
    /*
      if (localStorage.getItem('tokenVerificationEmail')) {
      this.isVerifyEmail();
      this.onDialogHide();
      }
    */

  }

  onDialogHide() {
    this.visible = false;
    this.visibleModal.emit(false);
  }

  // Mostrar el componente del register (solo si no esta autenticado)

  goRegister(open = true):void{
    this.isVisibleRegister = open;
  }

  // Mostrar el componente del recuperación de contraseña (solo si no est aautenticado)

  goForgotPassword(open = true):void{
    this.isVisiblePasswordForgot = open;
  }
  

  // Login (Vía correo electrónico/contraseña)

  loginwithEmailandPassword():void{
    if (this.formLogin.invalid) {
      this.alertService.miniAlert('Campos vacíos o inválidos.', 'info', 2500);
      this.formLogin.markAllAsTouched(); return ;
    }


    this.isLoadingLogin = true;
    

    this.authService.loginwithEmailandPassword(this.formLogin.value).subscribe({
      next: (s) => {
        this.isLoadingLogin = false;
        this.onDialogHide();
        this.alertService.miniAlert('Inicio de sesión exitoso', 'success', 2500);
        localStorage.setItem('userLogin', JSON.stringify(s.data)); 

        if (!s.data.email_verified_at) {
          this.alertService.miniAlert('Cuenta sin verificar, verifica tu cuenta primero.', 'warning', 3000);
          this.router.navigate(['no-verification']); 
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingLogin = false;
        this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
    })
  }

    // Login (Vía Facebook)

    async loginWithFacebook(): Promise<void> {
      try {
        const res = await this.loginSocialNetworks.loginWithFacebook();
        this.onDialogHide();
        console.log('¡Éxito!', res);
      } catch (err) {
        console.error('Error:', err);
      }
    }


    // Login (Vía Facebook)

    async loginWithGoogle(): Promise<void> {
      try {
        this.isLoadingLogin = true;
        
        const response = await this.loginSocialNetworks.loginWithGoogle().toPromise();

        setTimeout(() => {
          this.isLoadingLogin = false;
        }, 1500)
        
        this.onDialogHide();
        const firebaseUser = response?.firebaseUser;
        const backendData = response?.backendData;

        let jsonData = {
          ...firebaseUser,
          ...backendData
        }

        console.log(jsonData);
        localStorage.setItem('userLogin', JSON.stringify(jsonData));


      } catch (err:any) {
        this.isLoadingLogin = false;
        this.alertService.miniAlert(err.error.message, 'error', 1500);
      }
    }

    // En caso que ya este registrado y tenga pendiente la verificacion de correo

    isVerifyEmail():void{
      this.alertService.alertDefault('Verifica tu correo electrónico, revisa tu bandeja', 'warning', 0 ,  () => {
        this.visible = true;
        this.visibleModal.emit(true);
      })
    }

}
