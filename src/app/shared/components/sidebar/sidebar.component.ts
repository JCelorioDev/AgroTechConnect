import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenubarComponent } from '../menubar/menubar.component';
import { PostService } from '../../../core/services/Post/post.service';

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
    AvatarModule,
    MenubarComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isOpen = true;
  isMobile = false;
  checked: boolean = false;
  private readonly postService = inject(PostService);

  private resizeListener: (() => void) | null = null; // Corrección aquí

  menuItems = [
    { label: 'Publicaciones', route: 'publicaciones', icon: 'pi-book' },
    { label: 'Comunidad', route: 'comunidad', icon: 'pi-users' },
    { label: 'Preguntas sin resolver', route: 'preguntas', icon: 'pi-question' },
    { label: 'Mis publicaciones', route: 'mis-publicaciones', icon: 'pi-receipt' },
    { label: 'Logros', route: 'logros', icon: 'pi-trophy' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {

    if (this.isDarkModeActive()) {
      this.checked = localStorage.getItem('themeDark') === 'true' ? true : false;
    }


    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
      
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
        const isDarkModeActive = element.classList.contains('custom-dark-mode');
  
        if (isDarkModeActive) {
          // Modo oscuro activado, lo desactiva
          element.classList.remove('custom-dark-mode');
          localStorage.removeItem('themeDark');
        } else {
          // Modo oscuro desactivado, lo activa
          element.classList.add('custom-dark-mode');
          localStorage.setItem('themeDark', 'true');
        }
      }
    }
  }

  isDarkModeActive(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.querySelector('html');
      return element?.classList.contains('custom-dark-mode') ?? false;
    }
    return false;
  }

  setClickPost(): void {
    const currentValue = this.postService.isCreatePost();
    this.postService.setAddPublication(!currentValue);
  }

  
  
}