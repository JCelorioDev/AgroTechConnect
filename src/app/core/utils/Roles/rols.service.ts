import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolsService {

  constructor() { }

  get getRoles(): string {
    const userLogin = JSON.parse(localStorage.getItem('userLogin')!);
    return userLogin.roles ? JSON.parse(userLogin) : '';
  }

  hasRole(role: string): boolean {
    return this.getRoles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isClient(): boolean {
    return this.hasRole('client');
  }

  isClientSocial(): boolean {
    return this.hasRole('client_social');
  }

}
