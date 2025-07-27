import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommentsService } from '../../../core/services/Comments/comments.service';
import { CommentsPublicactionResponseInterfaceTs, Data, Datum } from '../../../core/models/Comments/commentsPublicationResponse.interface';
import { AlertService } from '../../../shared/alerts/alert.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GalleriaModule } from 'primeng/galleria';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'public-comments',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    DividerModule,
    CardModule,
    ProgressSpinnerModule,
    GalleriaModule,
    PaginatorModule,
    FormsModule,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent implements OnInit {
  public displayCommentsDialog = false;
  private readonly commentsService = inject(CommentsService);
  private readonly alertService = inject(AlertService);

  // Datos de comentarios
  public listComment: CommentsPublicactionResponseInterfaceTs | null = null;
  public loadingComments = false;
  public postingComment = false;
  public newComment = '';

  // Paginación
  public firstComment = 0;
  public rows = 5; // Número de comentarios por página


  @Input() idPublication!: string;
  @Output() closeDialog = new EventEmitter<void>();

// Modifica la función para cerrar el diálogo
closeComments(): void {
  this.closeDialog.emit();
}

  constructor() {}

  ngOnInit(): void {
    if (this.idPublication) {
      console.log(this.idPublication)
      this.loadComments();
    }

  }

  toggleCommentsDialog(): void {
    this.displayCommentsDialog = !this.displayCommentsDialog;
    if (this.displayCommentsDialog && !this.listComment) {
      this.loadComments();
    }
  }

  // Cargar comentarios con paginación
  loadComments(page: number = 1): void {
    this.loadingComments = true;
    this.commentsService.getsCommentsPublication(this.idPublication).subscribe({
      next: (response) => {
        this.listComment = response;
        this.loadingComments = false;
      },
      error: (err) => {
        this.loadingComments = false;
        this.handleError(err);
      }
    });
  }

  // Publicar nuevo comentario
  postComment(): void {

  }

  // Manejo de errores
  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error?.message || 'Error desconocido', 'error', 3000);
    }
  }

  // Cambio de página en paginación
  onPageChange(event: any): void {
    this.firstComment = event.first;
    this.rows = event.rows;
    const page = event.page + 1; // PrimeNG usa base 0, nuestra API usa base 1
    this.loadComments(page);
  }

  // Obtener etiqueta para avatar
  getAvatarLabel(user: Datum['user']): string {
    if (user.image?.url) return '';
    return (user.name.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Estilo para rangos de usuario
  getRangeSeverity(rangeName: string): any {
    switch(rangeName) {
      case 'Novato': return 'info';
      case 'Aprendiz': return 'success';
      case 'Iniciado': return 'warning';
      default: return 'info';
    }
  }

  // Ver respuesta de comentarios

  seeCommentsResponse(idComentario:string):void{
    console.log('hola');
    console.log(idComentario);
  }
}