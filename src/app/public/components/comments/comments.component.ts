import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommentsService } from '../../../core/services/Comments/comments.service';
import { CommentsPublicactionResponseInterfaceTs, Data, Datum } from '../../../core/models/Comments/commentsPublicationResponse.interface';
import { Data as DataComments, Datum as ResponseDatum } from '../../../core/models/Comments/responseOfComments.interface';
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
import { AccordionModule } from 'primeng/accordion';
import { Router } from '@angular/router';

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
    AccordionModule
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent implements OnInit {
  public displayCommentsDialog = false;
  private readonly commentsService = inject(CommentsService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  // Datos de comentarios
  public listComment: CommentsPublicactionResponseInterfaceTs | null = null;
  public listResponseOfComments: {[key: string]: DataComments} = {};
  public loadingComments = false;
  public postingComment = false;
  public newComment = '';
  public activeIndex: {[key: string]: boolean} = {};

  // Paginación
  public firstComment = 0;
  public rows = 5;

  @Input() idPublication!: string;
  @Output() closeDialog = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    if (this.idPublication) {
      this.loadComments();
    }
  }

  closeComments(): void {
    this.closeDialog.emit();
  }

  toggleCommentsDialog(): void {
    this.displayCommentsDialog = !this.displayCommentsDialog;
    if (this.displayCommentsDialog && !this.listComment) {
      this.loadComments();
    }
  }

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

  postComment(): void {
    // Lógica existente para publicar comentarios
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error?.message || 'Error desconocido', 'error', 3000);
    }
  }

  onPageChange(event: any): void {
    this.firstComment = event.first;
    this.rows = event.rows;
    const page = event.page + 1;
    this.loadComments(page);
  }

  getAvatarLabel(user: any): string {
    if (user.image?.url) return '';
    return (user.name.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }


  getRangeSeverity(rangeName: string): any {
    switch(rangeName) {
      case 'Novato': return 'info';
      case 'Aprendiz': return 'success';
      case 'Iniciado': return 'warning';
      default: return 'info';
    }
  }

  seeCommentsResponse(idComentario: string): void {
    if (this.activeIndex[idComentario]) {
      this.activeIndex[idComentario] = false;
      return;
    }

    if (!this.listResponseOfComments[idComentario]) {
      this.commentsService.getsCommentsResponse(idComentario).subscribe({
        next: (s) => {
          this.listResponseOfComments[idComentario] = s.data;
          this.activeIndex[idComentario] = true;
        },
        error: (err) => {
          if (err.status === 422) {
            this.alertService.showValidationErrors(err.error);
          } else {
            this.alertService.miniAlert(err.error.message, 'error', 3000);
          }
        }
      });
    } else {
      this.activeIndex[idComentario] = !this.activeIndex[idComentario];
    }
  }

  trackByCommentId(index: number, comment: Datum): string {
    return comment.id;
  }

  trackByResponseId(index: number, response: ResponseDatum): string {
    return response.id;
  }

  // ir a ver comentario

  goToComment(idComentario:string, opc:string):void{
    this.commentsService.setOpc(opc);
    this.router.navigate(['menu/mostrar-comentario', idComentario ]);
  }
}