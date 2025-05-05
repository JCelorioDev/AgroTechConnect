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
import { AlertService } from '../../alerts/alert.service';

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
  private readonly alertService = inject(AlertService);
  public isLoadingLogout:boolean = false;

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
    Swal.fire({
      title: "Estás seguro de cerrar sesión?",
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


}
