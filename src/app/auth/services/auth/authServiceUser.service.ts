import { inject, Injectable } from '@angular/core';
import { RequestRecoveryPasswordI } from '../../models/auth/requestRecoveryPasswordI.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceUser {

  constructor() { }

  private readonly httpClient = inject(HttpClient);

  // Mostrar la alerta solo si no esta aun verificado el correo =

  get showAlertnotverifyemail():boolean{

    if (!localStorage.getItem('tokenVerificationEmail')) {
      return false;
    }
  
    return true
  }

  //Envio de correo de verificacion 

  sendEmailVerification():Observable<RequestRecoveryPasswordI>{
  
    const token = localStorage.getItem('tokenVerificationEmail');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache'

    });
    return this.httpClient.post<RequestRecoveryPasswordI>(
      `${environment.apiBaseUrl}email/verify/send`, null,
      { headers }  // Envía los headers configurados
    );
  }

}
