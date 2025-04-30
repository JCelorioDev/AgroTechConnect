import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  // Alertas minis 

  miniAlert(msj: string, statusAlert: 'success' | 'error' | 'info' | 'warning' = 'info', time:number) {
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
}
