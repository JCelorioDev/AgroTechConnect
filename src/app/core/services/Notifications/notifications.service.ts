import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, interval, switchMap, startWith, catchError, of } from 'rxjs';
import { NotificationResponse } from '../../models/Notifications/notificationsResponse.interface';
import { environment } from '../../../../environments/environment';
import { NotificationsUnreadResponse } from '../../models/Notifications/notificationsUnreadResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);
  private notificationsSubject = new BehaviorSubject<NotificationResponse | null>(null);
  private pollingInterval = 30000; // 30 segundos

  // Observable público para componentes
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    // Iniciar polling automáticamente al inyectar el servicio
    this.startPolling();
  }

  // Obtener notificaciones con polling
  private startPolling(): void {
    interval(this.pollingInterval)
      .pipe(
        startWith(0), // Ejecutar inmediatamente
        switchMap(() => this.fetchNotifications()),
        catchError(error => {
          console.error('Error fetching notifications:', error);
          return of(null); // Continuar el polling incluso si hay error
        })
      )
      .subscribe(response => {
        if (response) {
          this.notificationsSubject.next(response);
        }
      });
  }

  getsNotification(page: number = 1): Observable<NotificationResponse> {
    return this.httpClient.get<NotificationResponse>(
      `${environment.apiBaseUrl}notifications?page=${page}`
    );
  }


  // Fetch actual de notificaciones
  private fetchNotifications(): Observable<NotificationResponse> {
    return this.httpClient.get<NotificationResponse>(`${environment.apiBaseUrl}notifications`).pipe(
      tap(response => {
        // Aquí puedes agregar lógica adicional si es necesario
      })
    );
  }

  // Forzar actualización manual
  refreshNotifications(): void {
    this.fetchNotifications().subscribe(response => {
      this.notificationsSubject.next(response);
    });
  }

  // Marcar notificación como leída

  markAsRead(notificationId: string): Observable<any> {
    return this.httpClient.patch(
      `${environment.apiBaseUrl}notifications/${notificationId}/read`, 
      {}
    );
  }
  // Marcar todas como leídas
  markAllAsRead(): Observable<any> {
    return this.httpClient.patch(
      `${environment.apiBaseUrl}notifications/read-all
`, 
      {}
    );
  }
  

  // Obtener notificaciones no leidas

  getsNotificationUnread():Observable<NotificationsUnreadResponse>{
    return this.httpClient.get<NotificationsUnreadResponse>( `${environment.apiBaseUrl}notifications/unread
      `)
  }
}