// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'user-theme';
  private darkTheme = 'lara-dark-blue';
  private lightTheme = 'lara-light-blue';
  currentTheme: string;

  constructor() {
    const savedTheme = localStorage.getItem(this.themeKey);
    this.currentTheme = savedTheme || this.lightTheme;
    this.applyTheme(this.currentTheme);
  }

  toggleTheme(): void {
    this.currentTheme = this.isDarkTheme() ? this.lightTheme : this.darkTheme;
    this.applyTheme(this.currentTheme);
    localStorage.setItem(this.themeKey, this.currentTheme);
  }

  isDarkTheme(): boolean {
    return this.currentTheme === this.darkTheme;
  }

  private applyTheme(theme: string): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `node_modules/primeng/resources/themes/${theme}/theme.css`;
    }
  }
}