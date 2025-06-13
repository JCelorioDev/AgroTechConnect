import { Component, inject} from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '../../../auth/pages/login/login.component';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { RegisterComponent } from '../../../auth/pages/register/register.component';
import Swal from 'sweetalert2';
import { AlertService } from '../../alerts/alert.service';
import { passwordMatchValidator } from '../../../core/validation/password repeat/passwordMatchValidator';
import { PasswordModule } from 'primeng/password';
import { InputOtp } from 'primeng/inputotp';
import { UserService } from '../../../core/services/User/user.service';
import { RolsService } from '../../../core/utils/Roles/rols.service';
import { parse } from 'path';

@Component({
  selector: 'shared-menubar',
  imports: [InputTextModule, ButtonModule, TooltipModule, CommonModule, FormsModule, Dialog, LoginComponent, RegisterComponent, ReactiveFormsModule, PasswordModule, InputOtp],
  standalone: true,
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss'
})
export class MenubarComponent {
  public searchQuery: string = '';

  public visible: boolean = false;
  private readonly router = inject(Router);
  public isVisibleLogin:boolean = false;
  public isVisibleRegister:boolean = false;
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);
  public isLoadingLogout:boolean = false;
  private previousState: string | null = null;
  private isLoggingOut = false; // ← Bandera para evitar falsos positivos
  public readonly rolService = inject(RolsService);
  public activeDialogEliminate:boolean = false; // Variable para activar el dialogo de confirmacion  de eliminar cuenta
  public activeDialogEliminate2:boolean = false;
  public formEliminateAccount!:FormGroup;
  public valueCodePasswordConfirmation:string = '';;
  public generatedCode: string = '';

  get getLocalStorageToken():any{
    return localStorage.getItem('userLogin')
  }

  ngOnInit():void{
    //this.startWatchingUserLogin();
    // Si el correo esta verificado se activará el método
    if (this.authService.getEmailVerified) {
      this.isEmailVerify();
    }
  }

  constructor(private formBuilder:FormBuilder){
    this.formEliminateAccount = this.formBuilder.group({
      password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,15}$/)]),
      password_confirmation : new FormControl('', [Validators.required])
    }, {
      validators: passwordMatchValidator('password', 'password_confirmation')
    });
  }


  showDialog() {
    this.visible = true;
  }


  // Mostrar el componente del login (solo si no esta autenticado)

  goLogin(open:any):void{
    this.isVisibleLogin = open;
  }

  // Mostrar el componente del register (solo si no esta autenticado)

  goRegister(open:any):void{
    this.isVisibleRegister = open;
  }

  // Cerrar sesión

  logout():void{
    this.isLoggingOut = true;
    Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Luego no podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, deseo.",
      cancelButtonText: "No, deseo."
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoadingLogout = true;
        this.authService.logout().subscribe({
          next: (s) => {
            localStorage.removeItem('userLogin');
            this.isLoadingLogout = false;
            Swal.fire({
              title: "Aviso",
              text: "Se cerró sesión correctamente.",
              icon: "success"
            });
            this.visible = false;
          },
          error: (err) => {
            this.alertService.miniAlert(err.error.message, 'error', 2500);
            localStorage.clear();
            this.isLoadingLogout = false;
          }
        })
      }
    });
  }

  get getstatusVisibleResetPassword():boolean{
    return this.authService.getstatusPassword
  }

  // Verificar si el usuario ya esta con el correo verificado

  isEmailVerify():void{
    this.alertService.miniAlert('¡Su correo electrónico se validó correctamente! 😎🥳', 'success', 3500);
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

  // Borrar la cuenta de un usuario

  modalConfirmationDeleteUser():void{
    this.alertService.alertwithDialogs('¿Estás seguro de eliminar tu cuenta de manera permanente?', 'Después no podras revertir esta acción', 'warning', 2500, (() => {
      if (this.getMethodRegister !== 'local') {
        this.openEliminateDialog();
        this.activeDialogEliminate2 = true; return;
      }

      this.activeDialogEliminate = true;
    }), 'No, deseo.', 'Si, deseo');
  }
  
  // Métodos para verificar cada requisito de contraseña
  get password() {
    return this.formEliminateAccount.get('password') as FormControl;
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

  // Logica para eliminar una cuenta desde un usuario cliente 

  deleteAccountUser(confirmButtonDelete?:boolean):void{
    if (this.formEliminateAccount.invalid && this.getMethodRegister === 'local') {
      this.alertService.miniAlert('Campos vacíos o inválidos.', 'info', 2500);
      this.formEliminateAccount.markAllAsTouched(); return ;
    }


    let isCorrectCodeVerification = true;
    this.activeDialogEliminate2 = true;
    this.activeDialogEliminate = false;
    
    if (this.generatedCode !== this.valueCodePasswordConfirmation && confirmButtonDelete){
      isCorrectCodeVerification = false;
      this.alertService.miniAlert('El código de verificación que ingresaste, no son iguales.', 'warning', 2500); return ;
    }else if (isCorrectCodeVerification && confirmButtonDelete){
      this.isLoadingLogout = true;

      const registration_method = JSON.parse(localStorage.getItem('userLogin')!);
      
      if (registration_method.registration_method !== 'local') {
        this.userService.deleteAccountUserbySocialNetwork().subscribe({
          next: (s) => {
            this.alertService.miniAlert('Tu cuenta se ha borrado de manera permanente, lamentamos tu perdida. =)', 'success', 3000);
            this.isLoadingLogout = false;
            this.activeDialogEliminate2 = false;
            this.valueCodePasswordConfirmation = '';
            localStorage.removeItem('userLogin');
          },
          error: (err) => {
            console.log(err);
            this.activeDialogEliminate2 = false;
            this.activeDialogEliminate = true;
            this.formEliminateAccount.reset();
            this.isLoadingLogout = false;
            this.valueCodePasswordConfirmation = '';
            localStorage.removeItem('userLogin');
    
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            }else{
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        })
      }else{
        this.userService.deleteAccountUser(this.formEliminateAccount.get('password')?.value).subscribe({
            next: (s) => {
              this.alertService.miniAlert('Tu cuenta se ha borrado de manera permanente, lamentamos tu perdida. =)', 'success', 3000);
              this.isLoadingLogout = false;
              this.activeDialogEliminate2 = false;
              this.valueCodePasswordConfirmation = '';
              localStorage.removeItem('userLogin');
            },
            error: (err) => {
              this.activeDialogEliminate2 = false;
              this.activeDialogEliminate = true;
              this.formEliminateAccount.reset();
              this.isLoadingLogout = false;
              this.valueCodePasswordConfirmation = '';
              localStorage.removeItem('userLogin');
      
              if (err.status === 422) {
                this.alertService.showValidationErrors(err.error);
              }else{
                this.alertService.miniAlert(err.error.message, 'error', 3000);
              }
            }
          })
        }
      }


  }


  // Llamar esto al abrir el diálogo
    openEliminateDialog() {
      this.generatedCode = this.generateRandomCode(6);
    }

  

  // Método para generar código numérico aleatorio de n dígitos
  generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  // Obntener metodo de registro 

  get getMethodRegister():string{
    const method = JSON.parse(localStorage.getItem('userLogin')!);
    return method?.data?.registration_method ? method?.data?.registration_method : 'local';
  }

  // Ir al componente de perfil

  goProfil(idUser?:string):void{
    this.router.navigate(['menu/perfil']);
  }
}
