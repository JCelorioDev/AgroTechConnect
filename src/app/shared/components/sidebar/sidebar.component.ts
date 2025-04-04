import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, CommonModule, RouterLink],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isOpen = true;
  isMobile = false;

  menuItems = [
    { label: 'Inicio', route: '/inicio', icon: 'pi-home' },
    { label: 'Productos', route: '/productos', icon: 'pi-box' },
    { label: 'Pedidos', route: '/pedidos', icon: 'pi-shopping-cart' },
    { label: 'Perfil', route: '/perfil', icon: 'pi-user' }
  ];

  constructor() {
    this.checkViewport();
  }

  @HostListener('window:resize')
  checkViewport() {
    this.isMobile = window.innerWidth <= 768;
    this.isOpen = !this.isMobile;
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    if (this.isMobile) this.isOpen = false;
  }
}
