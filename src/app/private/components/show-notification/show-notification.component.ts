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

@Component({
  selector: 'app-show-notification',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    RippleModule
  ],
  templateUrl: './show-notification.component.html',
  styleUrls: ['./show-notification.component.scss']
})
export class ShowNotificationComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public objNotification!: ShowNotificationResponseData;
  public loading = true;
  public notificationId!: string;

  ngOnInit(): void {
    this.notificationId = this.route.snapshot.paramMap.get('id')!;
    this.showNotification(this.notificationId);
  }

  showNotification(idNotification: string): void {
    this.loading = true;
    this.notificationsService.showNotification(idNotification).subscribe({
      next: (response) => {
        this.objNotification = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error?.message || 'Error al cargar la notificación', 'error', 3000);
        }
      }
    });
  }

  getNotificationIcon(type: string): string {
    const typeLower = type.toLowerCase();
    const icons: Record<string, string> = {
      'like': 'pi pi-thumbs-up',
      'comment': 'pi pi-comment',
      'reply': 'pi pi-reply',
      'follow': 'pi pi-user-plus',
      'reaction': 'pi pi-heart',
      'new_reaction': 'pi pi-heart-fill'
    };
    return icons[typeLower] || 'pi pi-bell';
  }

  getNotificationSeverity(type: string): string {
    const typeLower = type.toLowerCase();
    const severities: Record<string, string> = {
      'like': 'success',
      'comment': 'info',
      'reply': 'warn',  // Cambiado de 'warning' a 'warn'
      'follow': 'primary',
      'reaction': 'danger',
      'new_reaction': 'danger'
    };
    return severities[typeLower] || 'help';
  }

  navigateToPost(): void {
    if (this.objNotification.data.link_post) {
      // Extraer el ID encriptado de la URL completa
      const urlParts = this.objNotification.data.link_post.split('/');
      const encryptedId = urlParts[urlParts.length - 1];
      this.router.navigate(['menu/mostrar-publicacion', encryptedId]);
    } else if (this.objNotification.data.post_id) {
      // Fallback por si no hay link_post pero sí post_id
      this.router.navigate(['menu/mostrar-publicacion', this.objNotification.data.post_id]);
    }
  }
  

  navigateToProfile(): void {
    if (this.objNotification.data.link_sender_profile) {
      // Extraer el ID encriptado de la URL completa
      const urlParts = this.objNotification.data.link_sender_profile.split('/');
      const encryptedId = urlParts[urlParts.length - 1];
      this.router.navigate(['menu/perfil', encryptedId]);
    } else if (this.objNotification.data.sender_id) {
      // Fallback por si no hay link_sender_profile pero sí sender_id
      this.router.navigate(['menu/perfil', this.objNotification.data.sender_id]);
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
}