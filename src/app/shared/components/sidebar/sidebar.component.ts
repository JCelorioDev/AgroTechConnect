import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';


@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet,CommonModule, RouterLink, ToggleSwitch, FormsModule, ButtonModule, AvatarModule],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isOpen = true;
  isMobile = false;
  checked: boolean = true;

  menuItems = [
    { label: 'Publicaciones', route: 'publicaciones', icon: 'pi-book' },
    { label: 'Siguiendo', route: 'siguiendo', icon: 'pi-users' },
    { label: 'Preguntas sin resolver', route: 'preguntas', icon: 'pi-question' },
    { label: 'Mis preguntas', route: 'preguntas', icon: 'pi-receipt' },
    { label: 'Logros', route: 'logros', icon: 'pi-trophy' }
  ];

  ngOnInit():void{
    this.toggleDarkMode();
  }

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

  // Para cambiar al modo dark

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('custom-dark-mode');
    }
  }

  

  
  
}
