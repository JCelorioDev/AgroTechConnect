import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationsService } from '../../../core/services/Notifications/notifications.service';
import { ShowNotificationResponseData } from '../../../core/models/Notifications/showNotificationResponse.interface';
import { AlertService } from '../../../shared/alerts/alert.service';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-show-notification',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    RippleModule,
    BadgeModule,
    TooltipModule,
    DialogModule,
    AnimateOnScrollModule
  ],
  templateUrl: './show-notification.component.html',
  styleUrls: ['./show-notification.component.scss']
})
export class ShowNotificationComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clipboard = inject(Clipboard);

  public objNotification!: ShowNotificationResponseData;
  public loading = true;
  public notificationId!: string;
  public markAsReadLoading = false;
  public deleteLoading = false;
  public displayActionsDialog = false;

  ngOnInit(): void {
    this.notificationId = this.route.snapshot.paramMap.get('id')!;
    this.loadNotification();
  }

  loadNotification(): void {
    this.loading = true;
    this.notificationsService.showNotification(this.notificationId).subscribe({
      next: (response) => {
        this.objNotification = response.data;
        this.loading = false;
        if (!this.objNotification.is_read) {
          this.markNotificationAsRead();
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  markNotificationAsRead(): void {
    if (this.objNotification && !this.objNotification.is_read) {
      this.markAsReadLoading = true;
      this.notificationsService.markAsRead(this.notificationId).subscribe({
        next: () => {
          this.objNotification.is_read = true;
          this.objNotification.read_at = new Date().toISOString();
          this.markAsReadLoading = false;
          this.alertService.miniAlert('Notificación marcada como leída', 'success', 2000);
        },
        error: (err) => {
          this.markAsReadLoading = false;
          this.handleError(err);
        }
      });
    }
  }

  markNotificationAsUnread(): void {
    this.markAsReadLoading = true;
    this.notificationsService.markAsRead(this.notificationId).subscribe({
      next: () => {
        this.objNotification.is_read = false;
        this.objNotification.read_at = null;
        this.markAsReadLoading = false;
        this.alertService.miniAlert('Notificación marcada como no leída', 'success', 2000);
      },
      error: (err) => {
        this.markAsReadLoading = false;
        this.handleError(err);
      }
    });
  }


  copyLink(): void {
    const notificationLink = `${window.location.origin}/menu/notificaciones/${this.notificationId}`;
    this.clipboard.copy(notificationLink);
    this.alertService.miniAlert('Enlace copiado al portapapeles', 'success', 2000);
    this.displayActionsDialog = false;
  }

  getNotificationIcon(type: string): string {
    const typeLower = type.toLowerCase();
    const icons: Record<string, string> = {
      'like': 'pi pi-thumbs-up',
      'comment': 'pi pi-comments',
      'reply': 'pi pi-reply',
      'follow': 'pi pi-user-plus',
      'reaction': 'pi pi-heart-fill',
      'new_reaction': 'pi pi-bolt',
      'mention': 'pi pi-at',
      'system': 'pi pi-cog'
    };
    return icons[typeLower] || 'pi pi-bell';
  }

  getNotificationSeverity(type: string): string {
    const typeLower = type.toLowerCase();
    const severities: Record<string, string> = {
      'like': 'success',
      'comment': 'info',
      'reply': 'warning',
      'follow': 'help',
      'reaction': 'danger',
      'new_reaction': 'danger',
      'mention': 'contrast',
      'system': 'secondary'
    };
    return severities[typeLower] || 'primary';
  }

  navigateToPost(): void {
    if (this.objNotification.data.link_post) {
      const urlParts = this.objNotification.data.link_post.split('/');
      const encryptedId = urlParts[urlParts.length - 1];
      this.router.navigate(['menu/mostrar-publicacion', encryptedId]);
    }
  }

  navigateToProfile(): void {
    if (this.objNotification.data.link_sender_profile) {
      const urlParts = this.objNotification.data.link_sender_profile.split('/');
      const encryptedId = urlParts[urlParts.length - 1];
      this.router.navigate(['menu/perfil', encryptedId]);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeSince(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `Hace ${interval} ${unit}${interval === 1 ? '' : 's'}`;
      }
    }
    
    return 'Hace unos segundos';
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(
        err.error?.message || 'Ocurrió un error inesperado', 
        'error', 
        3000
      );
    }
  }
}