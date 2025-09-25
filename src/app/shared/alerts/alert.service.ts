import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private toastQueue: {message: string, status: 'success' | 'error' | 'info' | 'warning', time: number}[] = [];
  private isShowingToasts = false;
  private readonly TOAST_OFFSET = 70; // Espacio entre toasts en píxeles

  constructor() { }

  // Alertas mixin (toasts)
  miniAlert(msj: string, statusAlert: 'success' | 'error' | 'info' | 'warning' = 'info', time: number): void {
    this.toastQueue.push({message: msj, status: statusAlert, time: time});
    this.processToastQueue();
  }

  private processToastQueue() {
    if (this.isShowingToasts || this.toastQueue.length === 0) {
      return;
    }

    this.isShowingToasts = true;
    const toast = this.toastQueue.shift()!;
    const offset = (this.toastQueue.length + 1) * this.TOAST_OFFSET;

    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: toast.time,
      timerProgressBar: true,
      customClass: {
        popup: 'custom-dark-mode',
      },
      didOpen: (popup) => {
        const element = popup as HTMLElement;
        element.style.bottom = `${offset}px`;
        element.style.right = '20px';

        popup.onmouseenter = Swal.stopTimer;
        popup.onmouseleave = Swal.resumeTimer;
      },
      didClose: () => {
        this.isShowingToasts = false;
        setTimeout(() => this.processToastQueue(), 100);
      }
    });

    Toast.fire({
      icon: toast.status,
      title: toast.message,
    });
  }

  // Alertas por defecto
  alertDefault(msj: string, statusAlert: 'success' | 'error' | 'info' | 'warning' = 'info', time?: number, onConfirm?: () => void): void {
    Swal.fire({
      title: "Atención",
      text: msj,
      icon: statusAlert,
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK"
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
  }

    // Alertas con dialogos
    alertwithDialogs(
      title: string,
      msj: string,
      statusAlert: 'success' | 'error' | 'info' | 'warning' = 'info',
      time?: number,
      onConfirm?: () => void,
      txtButtonCancel: string = 'Cancelar',
      txtButtonConfirm: string = 'Confirmar',
      htmlContent?: string
    ): void {
      Swal.fire({
        title: title,
        text: msj,
        icon: statusAlert,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: txtButtonConfirm,
        cancelButtonText: txtButtonCancel,
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: htmlContent || undefined
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm?.();
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

    // Mostrar cada mensaje de error como un toast independiente
    if (errorMessages.length > 0) {
      errorMessages.forEach(message => {
        this.miniAlert(message, 'error', 2500);
      });
    }
  }

  
}
