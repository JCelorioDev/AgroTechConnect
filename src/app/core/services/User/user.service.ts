import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseUserI } from '../../models/User/userResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly httpClient = inject(HttpClient);

  constructor() { }

  // Borrar la cuenta de usuarIo (método local)

  deleteAccountUser(password:string){
    return this.httpClient.put(`${environment.apiBaseUrl}me`, {
      'password' : password
    });
  }

  // Borrar la cuenta de usuarIo (método redes sociales)

  deleteAccountUserbySocialNetwork(){
    return this.httpClient.put(`${environment.apiBaseUrl}me/social`, null);
  }

  // Mostrar la información de usurio por token

  getInformation():Observable<ResponseUserI>{
    return this.httpClient.get<ResponseUserI>(`${environment.apiBaseUrl}me/profile`);
  }

}
