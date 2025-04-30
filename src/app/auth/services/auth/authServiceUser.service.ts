import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceUser {

  constructor() { }

  // Mostrar la alerta solo si no esta aun verificado el correo =

  get showAlertnotverifyemail():boolean{

    if (!localStorage.getItem('tokenVerificationEmail')) {
      return false;
    }
  
    return true
  }

}
