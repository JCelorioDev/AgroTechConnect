import { Component, inject} from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '../../../auth/pages/login/login.component';



@Component({
  selector: 'shared-menubar',
  imports: [InputTextModule, ButtonModule, TooltipModule, CommonModule, FormsModule, Dialog, LoginComponent],
  standalone: true,
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss'
})
export class MenubarComponent {
  public searchQuery: string = '';

  public visible: boolean = false;
  private readonly router = inject(Router);
  public isVisibleLogin:boolean = false;

  get getLocalStorageToken():any{
    return localStorage.getItem('userLogin')
  }




  showDialog() {
    this.visible = true;
  }

  // Mostrar el componente del login solo si no esta autenticado

  goLogin(open:any):void{
    this.isVisibleLogin = open;
    console.log(this.isVisibleLogin);
  }

  // Cerrar sesión

  logout():void{
    
  }

}
