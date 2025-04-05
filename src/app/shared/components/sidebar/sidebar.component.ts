import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    ToggleSwitch,
    FormsModule,
    ButtonModule,
    AvatarModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isOpen = true;
  isMobile = false;
  checked: boolean = true;
  private resizeListener: (() => void) | null = null; // Corrección aquí

  menuItems = [
    { label: 'Publicaciones', route: 'publicaciones', icon: 'pi-book' },
    { label: 'Siguiendo', route: 'siguiendo', icon: 'pi-users' },
    { label: 'Preguntas sin resolver', route: 'preguntas', icon: 'pi-question' },
    { label: 'Mis preguntas', route: 'preguntas', icon: 'pi-receipt' },
    { label: 'Logros', route: 'logros', icon: 'pi-trophy' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
      this.toggleDarkMode();
      
      // Usamos arrow function para mantener el contexto de 'this'
      this.resizeListener = () => this.checkViewport();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  checkViewport() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      this.isOpen = !this.isMobile;
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  toggleDarkMode() {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.querySelector('html');
      if (element !== null) {
        element.classList.toggle('custom-dark-mode');
      }
    }
  }
}