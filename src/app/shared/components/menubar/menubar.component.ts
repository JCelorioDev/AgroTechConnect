import { Component, inject} from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '../../../auth/pages/login/login.component';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { RegisterComponent } from '../../../auth/pages/register/register.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'shared-menubar',
  imports: [InputTextModule, ButtonModule, TooltipModule, CommonModule, FormsModule, Dialog, LoginComponent, RegisterComponent],
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

  get getLocalStorageToken():any{
    return localStorage.getItem('userLogin')
  }

  ngOnInit():void{
    // Si el correo esta verificado se activará el método
    if (this.authService.getEmailVerified) {
      this.isEmailVerify();
    }
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
    this.authService.logout().subscribe({
      next: (s) => {
        localStorage.removeItem('userLogin');
        this.visible = false;
      },
      error: (err) => {

      }
    })
  }

  get getstatusVisibleResetPassword():boolean{
    return this.authService.getstatusPassword
  }

  // Verificar si el usuario ya esta con el correo verificado

  isEmailVerify():void{
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3500,
      customClass: {
        popup: 'custom-dark-mode'
      },
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "success",
      title: "¡Su correo electrónico se validó correctamente! 😎🥳"
    });

  }


}
