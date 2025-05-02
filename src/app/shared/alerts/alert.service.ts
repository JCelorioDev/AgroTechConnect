import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  // Alertas mixis 

  miniAlert(msj: string, statusAlert: 'success' | 'error' | 'info' | 'warning' = 'info', time:number):void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: time,
      timerProgressBar: true,
      customClass: {
        popup: 'custom-dark-mode',
      },
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    Toast.fire({
      icon: statusAlert,
      title: msj,
    });
  }

  // Alertas por defecto

  alertDefault(msj: string, statusAlert: 'success' | 'error' | 'info' | 'warning' = 'info', time?:number, onConfirm?: () => void):void{
      Swal.fire({
        title: "Atención",
        text: msj,
        icon: statusAlert,
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK"
      }).then((result) => {
        if (result.isConfirmed) {
          if(onConfirm){
            onConfirm();
          }
        }
      });
    }

  // Alertas de validaciones 

  showValidationErrors(errorResponse: any): void {
    const errors = errorResponse.data;
    let errorMessages: string[] = [];

    // Recoger todos los mensajes de error
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        errorMessages = errorMessages.concat(errors[field]);
      }
    }

    // Mostrar todos los mensajes en un solo SweetAlert
    if (errorMessages.length > 0) {
      this.miniAlert(errorMessages.join('<br><br>'), 'error', 2500);
    }
  }
  
}
