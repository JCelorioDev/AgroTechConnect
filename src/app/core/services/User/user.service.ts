import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

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

}
