import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponseI } from '../../../auth/models/auth/loginResponseI.interface';
import { LoginRequestI } from '../../../auth/models/auth/loginRequestI.interface';
import { environment } from '../../../../environments/environment';
import { LogoutResponseI } from '../../../auth/models/auth/logoutResponseI.interface';
import { RegisterResponseI } from '../../../auth/models/auth/registerResponseI.interface';
import { RegisterRequestI } from '../../../auth/models/auth/registerRequestI.interface';
import { ForgotPasswordComponent } from '../../../auth/pages/forgot-password/forgot-password.component';
import { ForgotPasswordRequestI } from '../../../auth/models/auth/forgotPasswordRequest.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isEmailVerified = false;

  private readonly httpClient = inject(HttpClient);

  constructor() { }



  // Login (Método de correo/contraseña)

  loginwithEmailandPassword(FormLogin:LoginRequestI):Observable<LoginResponseI>{
    let apiBaseUrl = environment.apiBaseUrl;
    return this.httpClient.post<LoginResponseI>(`${apiBaseUrl}auth/login`, FormLogin)
  }

  // Registro (Método de correo/contraseña)

  registerwithEmailandPassword(FormRegister:RegisterRequestI):Observable<RegisterResponseI>{
    let apiBaseUrl = environment.apiBaseUrl;
    return this.httpClient.post<RegisterResponseI>(`${apiBaseUrl}auth/register`, FormRegister)
  }


  // Cerrar sesión

  logout():Observable<LogoutResponseI>{
    let apiBaseUrl = environment.apiBaseUrl;
    return this.httpClient.post<LogoutResponseI>(`${apiBaseUrl}auth/logout`, null)
  }

  setEmailVerified(status: boolean) {
    this.isEmailVerified = status;
  }

  getEmailVerified(): boolean {
    return this.isEmailVerified;
  }

  verificationEmail(id:string = '', hash:string = '', expires:string = '', signature:string = ''){
    return this.httpClient.get(`${environment.apiBaseUrl}email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`)
  }

  // Recuperación de correo electrónico

  forgotPassword(FormForgotPassword:ForgotPasswordRequestI):Observable<ForgotPasswordComponent>{
    return this.httpClient.post<ForgotPasswordComponent>(`${environment.apiBaseUrl}password/forgot`, FormForgotPassword)
  }


}
