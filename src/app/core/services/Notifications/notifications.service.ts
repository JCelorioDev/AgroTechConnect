import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, interval, switchMap, startWith, catchError, of } from 'rxjs';
import { NotificationResponse } from '../../models/Notifications/notificationsResponse.interface';
import { environment } from '../../../../environments/environment';
import { NotificationsUnreadResponse } from '../../models/Notifications/notificationsUnreadResponse.interface';
import { ShowNotificationResponse } from '../../models/Notifications/showNotificationResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);
  
  // Subjects para manejar el estado de las notificaciones
  private notificationsSubject = new BehaviorSubject<NotificationResponse | null>(null);
  private unreadNotificationsSubject = new BehaviorSubject<NotificationsUnreadResponse | null>(null);
  
  // Intervalo de polling (30 segundos)
  private pollingInterval = 30000;

  // Observables públicos para los componentes
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadNotifications$ = this.unreadNotificationsSubject.asObservable();

  constructor() {
    this.startPolling();
  }

  /**
   * Inicia el polling automático para mantener actualizadas las notificaciones
   */
  private startPolling(): void {
    interval(this.pollingInterval)
      .pipe(
        startWith(0), // Ejecutar inmediatamente al iniciar
        switchMap(() => this.fetchAllNotifications()),
        catchError(error => {
          console.error('Error en polling de notificaciones:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.notificationsSubject.next(response);
          }
        },
        error: (err) => console.error('Error en polling:', err)
      });
  }

  /**
   * Obtiene todas las notificaciones (para polling y carga manual)
   */
  private fetchAllNotifications(): Observable<NotificationResponse> {
    return this.httpClient.get<NotificationResponse>(
      `${environment.apiBaseUrl}notifications`
    );
  }

  /**
   * Obtiene notificaciones paginadas
   * @param page Número de página
   */
  getNotifications(page: number = 1): Observable<NotificationResponse> {
    return this.httpClient.get<NotificationResponse>(
      `${environment.apiBaseUrl}notifications?page=${page}`
    ).pipe(
      tap(response => this.notificationsSubject.next(response))
    );
  }

  /**
   * Obtiene notificaciones no leídas
   */
  getUnreadNotifications(): Observable<NotificationsUnreadResponse> {
    return this.httpClient.get<NotificationsUnreadResponse>(
      `${environment.apiBaseUrl}notifications/unread`
    ).pipe(
      tap(response => this.unreadNotificationsSubject.next(response))
    );
  }

  /**
   * Marca una notificación como leída
   * @param notificationId ID de la notificación
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.httpClient.put(
      `${environment.apiBaseUrl}notifications/${notificationId}/read`,
      {}
    ).pipe(
      tap(() => this.refreshNotifications())
    );
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<any> {
    return this.httpClient.put(
      `${environment.apiBaseUrl}notifications/read-all`,
      {}
    ).pipe(
      tap(() => this.refreshNotifications())
    );
  }

  /**
   * Actualiza manualmente todas las notificaciones
   */
  refreshNotifications(): void {
    this.fetchAllNotifications().subscribe(response => {
      if (response) {
        this.notificationsSubject.next(response);
      }
    });
    this.getUnreadNotifications().subscribe();
  }

  // Ver una notificación

  showNotification(idNotificacion:string):Observable<ShowNotificationResponse>{
    return this.httpClient.get<ShowNotificationResponse>(`${environment.apiBaseUrl}notifications/${idNotificacion}`)
  }
}