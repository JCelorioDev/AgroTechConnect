import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/Auth/auth.service';

@Component({
  selector: 'auth-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Dialog, ButtonModule, CheckboxModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public visible: boolean = true;
  googleChecked: boolean = false;
  facebookChecked: boolean = true;

  public formLogin!:FormGroup;
  private formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

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

  }

  onDialogHide() {
    this.visible = false;
    this.visibleModal.emit(false);
  }

  // Login (Vía correo electrónico/contraseña)

  loginwithEmailandPassword():void{
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched(); return ;
    }

    this.authService.loginwithEmailandPassword(this.formLogin.value).subscribe({
      next: (s) => {
        localStorage.setItem('userLogin', JSON.stringify(s.data));
        this.onDialogHide();
      },
      error: (err) => {
        if (err.statusCode === 404) {
          console.log('Usuario no encontrado.')
        }
      }
    })
  }
}
