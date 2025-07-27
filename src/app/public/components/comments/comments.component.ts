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
import Swal from 'sweetalert2';
import { FileUploadModule } from 'primeng/fileupload';

     
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
    AccordionModule,
    FileUploadModule
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

  // Denunciar un comentario

  denuncieComment(idComentario:string){
    this.closeDialog.emit();

    Swal.fire({
      title: 'Añade la descripción de la denuncia',
      input: 'textarea',
      inputPlaceholder: 'Describe el motivo de tu denuncia...',
      inputAttributes: {
        'aria-label': 'Escribe tu descripción aquí'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar denuncia',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (description) => {
        if (!description) {
          Swal.showValidationMessage('La descripción es requerida');
        }
        return description;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        const description = result.value;

        this.commentsService.denuncieComment(idComentario, description).subscribe({
          next: (s) => {
            this.alertService.miniAlert('La denuncia se realizó correctamente.', 'success', 3000);
          },
          error: (err) => {
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            } else {
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        })
      }
    });
  }

  // Denunciar respuesta de comentario

  denuncieReplayComment(idComentario:string){
    this.closeDialog.emit();

    Swal.fire({
      title: 'Añade la descripción de la denuncia',
      input: 'textarea',
      inputPlaceholder: 'Describe el motivo de tu denuncia...',
      inputAttributes: {
        'aria-label': 'Escribe tu descripción aquí'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar denuncia',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (description) => {
        if (!description) {
          Swal.showValidationMessage('La descripción es requerida');
        }
        return description;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        const description = result.value;

        this.commentsService.denuncieReplayComment(idComentario, description).subscribe({
          next: (s) => {
            this.alertService.miniAlert('La denuncia se realizó correctamente.', 'success', 3000);
          },
          error: (err) => {
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            } else {
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        })
      }
    });
  }

  public uploadedFiles: File[] = [];
  public previewImages: string[] = [];

  // Crear un comentario en publicacion

  createCommentInPost(): void {
    if (!this.newComment.trim() && this.uploadedFiles.length === 0) {
      this.alertService.miniAlert('El comentario no puede estar vacío', 'warning', 3000);
      return;
    }
  
    this.postingComment = true;
  
    const formData = new FormData();
    formData.append('comment', this.newComment);
    
    // Agregar imágenes al FormData
    this.uploadedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
  
    this.commentsService.commentInPost(this.idPublication, formData).subscribe({
      next: (response) => {
        this.alertService.miniAlert('Comentario publicado', 'success', 2000);
        this.newComment = '';
        this.uploadedFiles = [];
        this.previewImages = [];
        this.postingComment = false;
        
        // Actualizar la lista de comentarios
        this.loadComments();
      },
      error: (err) => {
        this.postingComment = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }

  // Método para manejar la selección de imágenes
  onFileSelect(event: any): void {
    const files: File[] = Array.from(event.files);
    
    files.forEach(file => {
      this.uploadedFiles.push(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // Método para eliminar una imagen
  removeImage(index: number): void {
    this.uploadedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }
}