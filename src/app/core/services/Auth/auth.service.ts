import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponseI } from '../../../auth/models/auth/loginResponseI.interface';
import { LoginRequestI } from '../../../auth/models/auth/loginRequestI.interface';
import { environment } from '../../../../environments/environment';
import { LogoutResponseI } from '../../../auth/models/auth/logoutResponseI.interface';
import { RegisterResponseI } from '../../../auth/models/auth/registerResponseI.interface';
import { RegisterRequestI } from '../../../auth/models/auth/registerRequestI.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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

}
