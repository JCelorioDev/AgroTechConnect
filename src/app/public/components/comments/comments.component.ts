import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommentsService } from '../../../core/services/Comments/comments.service';
import { CommentsPublicactionResponseInterfaceTs, Data, Datum } from '../../../core/models/Comments/commentsPublicationResponse.interface';
import { Data as DataComments, Datum as ResponseDatum } from '../../../core/models/Comments/responseOfComments.interface';
import { Data as DataReactionsComment } from '../../../core/models/Reactions/reactionsCommentResponse.interface';
import { Data as DataReactionsReplayComment } from '../../../core/models/Reactions/reactionsReplayCommentResponse.interface';
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
import { finalize } from 'rxjs';
import { ReactionsService } from '../../../core/services/Reactions/reactions.service';
import { TabViewModule } from 'primeng/tabview';
import { TextareaModule } from 'primeng/textarea';


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
    FileUploadModule,
    TabViewModule,
    TextareaModule
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent implements OnInit {
  public displayCommentsDialog = false;
  private readonly commentsService = inject(CommentsService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly reactionsService = inject(ReactionsService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  // Datos de comentarios
  public listComment: CommentsPublicactionResponseInterfaceTs | null = null;
  public listResponseOfComments: { [key: string]: DataComments } = {};
  public loadingComments = false;
  public postingComment = false;
  public newComment = '';
  public activeIndex: { [key: string]: boolean } = {};

  // Propiedades para respuestas
  public replyingToCommentId: string | null = null;
  public replyCommentText: string = '';
  public replyUploadedFiles: File[] = [];
  public replyPreviewImages: string[] = [];
  public postingReply = false;

  // Paginación
  public firstComment = 0;
  public rows = 5;

  // Reacciones a comentarios
  public displayCommentReactionsDialog = false;
  public loadingCommentReactions = false;
  public commentReactionsData: DataReactionsComment | null = null;
  public activeCommentReactionTab = 0;
  public reactingCommentId: string | null = null;

  // Reacciones a respuestas
  public displayReplayReactionsDialog = false;
  public loadingReplayReactions = false;
  public replayReactionsData: DataReactionsReplayComment | null = null;
  public activeReplayReactionTab = 0;
  public reactingReplayId: string | null = null;

  @Input() idPublication!: string;
  @Output() closeDialog = new EventEmitter<void>();

  constructor() { }

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
    switch (rangeName) {
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

  goToComment(idComentario: string, opc: string, idPublicacion: string): void {
    this.commentsService.setOpc(opc);
    this.router.navigate(['menu/mostrar-comentario', idPublicacion, idComentario]);
  }

  denuncieComment(idComentario: string): void {
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
        });
      }
    });
  }

  denuncieReplayComment(idComentario: string): void {
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
        });
      }
    });
  }

  public uploadedFiles: File[] = [];
  public previewImages: string[] = [];

  createCommentInPost(): void {
    if (!this.newComment.trim() && this.uploadedFiles.length === 0) {
      this.alertService.miniAlert('El comentario no puede estar vacío', 'warning', 3000);
      return;
    }

    this.postingComment = true;

    const formData = new FormData();
    formData.append('comment', this.newComment);

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

  onFileSelect(event: any): void {
    const files: File[] = Array.from(event.files);

    files.forEach(file => {
      this.uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.uploadedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  startReply(commentId: string): void {
    this.replyingToCommentId = commentId;
    this.replyCommentText = '';
    this.replyUploadedFiles = [];
    this.replyPreviewImages = [];
  }

  cancelReply(): void {
    this.replyingToCommentId = null;
    this.replyCommentText = '';
    this.replyUploadedFiles = [];
    this.replyPreviewImages = [];
  }

  onReplyFileSelect(event: any): void {
    const files: File[] = Array.from(event.files);

    files.forEach(file => {
      this.replyUploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.replyPreviewImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeReplyImage(index: number): void {
    this.replyUploadedFiles.splice(index, 1);
    this.replyPreviewImages.splice(index, 1);
  }

  postReply(): void {
    if (!this.replyingToCommentId) return;
  
    if (!this.replyCommentText.trim() && this.replyUploadedFiles.length === 0) {
      this.alertService.miniAlert('La respuesta no puede estar vacía', 'warning', 3000);
      return;
    }
  
    this.postingReply = true;
  
    const formData = new FormData();
    formData.append('comment', this.replyCommentText);
  
    // Adjuntar imágenes correctamente
    this.replyUploadedFiles.forEach((file, index) => {
      formData.append(`images`, file); // Cambiado a usar el mismo nombre para múltiples archivos
    });
    
  
    this.commentsService.createReplayComment(
      this.idPublication,
      this.replyingToCommentId,
      formData
    ).subscribe({
      next: (response) => {
        if (response.data) {
          // Asegurar compatibilidad con la interfaz
          const newResponse: ResponseDatum = {
            ...response.data,
            reactions_count: (response.data.positive_reactions_count || 0) + (response.data.negative_reactions_count || 0),
            images: response.data.images || [],
            user: response.data.user || this.getCurrentUser()
          };
  
          // Actualización local segura
          if (this.listResponseOfComments[this.replyingToCommentId!]) {
            this.listResponseOfComments[this.replyingToCommentId!].data.unshift(newResponse);
            this.listResponseOfComments[this.replyingToCommentId!].total++;
            
            const parentComment = this.listComment?.data?.data.find(c => c.id === this.replyingToCommentId);
            if (parentComment) {
              parentComment.replies_count = (parentComment.replies_count || 0) + 1;
            }
          }
        }
        
        this.resetReplyState();
      },
      error: (err) => {
        this.handleReplyError(err);
      }
    });
  }

  private getCurrentUser(): any {
    try {
      const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
      return {
        id: userLogin.id,
        name: userLogin.name,
        lastname: userLogin.lastname,
        image: userLogin.image,
        ranges: userLogin.ranges || []
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        id: 'unknown',
        name: 'Usuario',
        lastname: '',
        image: null,
        ranges: []
      };
    }
  }

  private resetReplyState(): void {
    this.postingReply = false;
    this.replyingToCommentId = null;
    this.replyCommentText = '';
    this.replyUploadedFiles = [];
    this.replyPreviewImages = [];
    this.changeDetector.detectChanges();
  }
  
  private handleReplyError(err: any): void {
    this.postingReply = false;
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(
        err.error?.message || 'Error al publicar la respuesta', 
        'error', 
        3000
      );
    }
  }

  private loadCommentResponses(commentId: string): void {
    this.commentsService.getsCommentsResponse(commentId).subscribe({
      next: (response) => {
        this.listResponseOfComments[commentId] = response.data;
      },
      error: (err) => this.handleError(err)
    });
  }

  showCommentReactionsDialog(commentId: string): void {
    this.displayCommentReactionsDialog = true;
    this.loadingCommentReactions = true;

    this.reactionsService.getReactionsComment(commentId).subscribe({
      next: (response) => {
        this.commentReactionsData = response.data;
        this.loadingCommentReactions = false;
      },
      error: (err) => {
        this.loadingCommentReactions = false;
        this.handleError(err);
      }
    });
  }

  showReplayReactionsDialog(replayId: string): void {
    this.displayReplayReactionsDialog = true;
    this.loadingReplayReactions = true;

    this.reactionsService.getReplayReactionsComment(replayId).subscribe({
      next: (response) => {
        this.replayReactionsData = response.data;
        this.loadingReplayReactions = false;
      },
      error: (err) => {
        this.loadingReplayReactions = false;
        this.handleError(err);
      }
    });
  }

  countCommentReactionsByType(type: string): number {
    if (!this.commentReactionsData?.all_reactions) return 0;
    return this.commentReactionsData.all_reactions.filter((r: any) => r.type === type).length;
  }

  countReplayReactionsByType(type: string): number {
    if (!this.replayReactionsData?.all_reactions) return 0;
    return this.replayReactionsData.all_reactions.filter((r: any) => r.type === type).length;
  }

  hasReactedToComment(commentId: string, type: string): boolean {
    try {
      const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
      const currentUserEmail = userLogin.email;

      if (!this.commentReactionsData || !this.commentReactionsData.all_reactions) {
        return false;
      }

      return this.commentReactionsData.all_reactions.some(
        (r: any) => r?.user?.email === currentUserEmail && r.type === type
      );
    } catch (error) {
      console.error('Error checking comment reaction:', error);
      return false;
    }
  }

  hasReactedToReplay(replayId: string, type: string): boolean {
    try {
      const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
      const currentUserEmail = userLogin.email;

      if (!this.replayReactionsData || !this.replayReactionsData.all_reactions) {
        return false;
      }

      return this.replayReactionsData.all_reactions.some(
        (r: any) => r?.user?.email === currentUserEmail && r.type === type
      );
    } catch (error) {
      console.error('Error checking replay reaction:', error);
      return false;
    }
  }

  reactionAComment(commentId: string, type: string): void {
    if (this.reactingCommentId === commentId) return;
    this.reactingCommentId = commentId;

    const hadPositive = this.hasReactedToComment(commentId, 'positivo');
    const hadNegative = this.hasReactedToComment(commentId, 'negativo');
    const isSameReaction = (type === 'positivo' && hadPositive) || (type === 'negativo' && hadNegative);

    const comment = this.listComment?.data?.data.find(c => c.id === commentId);
    if (!comment) return;

    const originalPositive = comment.positive_reactions_count;
    const originalNegative = comment.negative_reactions_count;

    this.updateLocalCounts(comment, type, hadPositive, hadNegative);
    this.updateLocalReactionState(commentId, type, hadPositive, hadNegative, 'comment');

    const action = isSameReaction ?
      this.reactionsService.removeReactionAComment(commentId) :
      this.reactionsService.reactionsAComment(commentId, type);

    action.subscribe({
      next: (response: any) => {
        if (response.data) {
          comment.positive_reactions_count = response.data.counts.positive;
          comment.negative_reactions_count = response.data.counts.negative;

          if (this.commentReactionsData) {
            this.commentReactionsData = response.data;
          }
        }
        this.reactingCommentId = null;
      },
      error: (err) => {
        comment.positive_reactions_count = originalPositive;
        comment.negative_reactions_count = originalNegative;
        this.updateLocalReactionState(commentId, type, hadPositive, hadNegative, 'comment', true);
        this.handleError(err);
        this.reactingCommentId = null;
      }
    });
  }

  reactionAReplayComment(replayId: string, type: string): void {
    if (this.reactingReplayId === replayId) return;
    this.reactingReplayId = replayId;

    const hadPositive = this.hasReactedToReplay(replayId, 'positivo');
    const hadNegative = this.hasReactedToReplay(replayId, 'negativo');
    const isSameReaction = (type === 'positivo' && hadPositive) || (type === 'negativo' && hadNegative);

    let response: any;
    for (const commentId in this.listResponseOfComments) {
      response = this.listResponseOfComments[commentId].data.find((r: any) => r.id === replayId);
      if (response) break;
    }
    if (!response) return;

    const originalPositive = response.positive_reactions_count;
    const originalNegative = response.negative_reactions_count;

    this.updateLocalCounts(response, type, hadPositive, hadNegative);
    this.updateLocalReactionState(replayId, type, hadPositive, hadNegative, 'replay');

    const action = isSameReaction ?
      this.reactionsService.removeReactionAReplayComment(replayId) :
      this.reactionsService.reactionsAReplayComment(replayId, type);

    action.subscribe({
      next: (responseData: any) => {
        if (responseData.data) {
          response.positive_reactions_count = responseData.data.counts.positive;
          response.negative_reactions_count = responseData.data.counts.negative;

          if (this.replayReactionsData) {
            this.replayReactionsData = responseData.data;
          }
        }
        this.reactingReplayId = null;
      },
      error: (err) => {
        response.positive_reactions_count = originalPositive;
        response.negative_reactions_count = originalNegative;
        this.updateLocalReactionState(replayId, type, hadPositive, hadNegative, 'replay', true);
        this.handleError(err);
        this.reactingReplayId = null;
      }
    });
  }

  private updateLocalCounts(
    item: any,
    type: string,
    hadPositive: boolean,
    hadNegative: boolean,
    revert = false
  ): void {
    if (revert) return;

    if (type === 'positivo') {
      if (hadPositive) {
        item.positive_reactions_count--;
      } else {
        item.positive_reactions_count++;
        if (hadNegative) {
          item.negative_reactions_count--;
        }
      }
    } else if (type === 'negativo') {
      if (hadNegative) {
        item.negative_reactions_count--;
      } else {
        item.negative_reactions_count++;
        if (hadPositive) {
          item.positive_reactions_count--;
        }
      }
    }
  }

  private updateLocalReactionState(
    id: string,
    type: string,
    hadPositive: boolean,
    hadNegative: boolean,
    reactionType: 'comment' | 'replay',
    revert = false
  ): void {
    const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
    const currentUserEmail = userLogin.email;

    if (revert) {
      this.changeDetector.detectChanges();
      return;
    }

    let reactionsData: any;
    if (reactionType === 'comment') {
      if (!this.commentReactionsData) return;
      reactionsData = this.commentReactionsData;
    } else {
      if (!this.replayReactionsData) return;
      reactionsData = this.replayReactionsData;
    }

    if (!reactionsData.all_reactions) return;

    if (type === 'positivo') {
      if (hadPositive) {
        reactionsData.all_reactions = reactionsData.all_reactions.filter(
          (r: any) => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
        if (reactionsData.positive_reactions) {
          reactionsData.positive_reactions = reactionsData.positive_reactions.filter(
            (r: any) => !(r.user?.email === currentUserEmail)
          );
        }
      } else {
        reactionsData.all_reactions = reactionsData.all_reactions.filter(
          (r: any) => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
        if (reactionsData.negative_reactions) {
          reactionsData.negative_reactions = reactionsData.negative_reactions.filter(
            (r: any) => !(r.user?.email === currentUserEmail)
          );
        }

        const newReaction = {
          type: 'positivo',
          user: {
            email: currentUserEmail,
            name: userLogin.name,
            lastname: userLogin.lastname,
            image: userLogin.image
          },
          created_at: new Date().toISOString()
        };

        reactionsData.all_reactions.push(newReaction);
        if (reactionsData.positive_reactions) {
          reactionsData.positive_reactions.push(newReaction);
        }
      }
    } else if (type === 'negativo') {
      if (hadNegative) {
        reactionsData.all_reactions = reactionsData.all_reactions.filter(
          (r: any) => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
        if (reactionsData.negative_reactions) {
          reactionsData.negative_reactions = reactionsData.negative_reactions.filter(
            (r: any) => !(r.user?.email === currentUserEmail)
          );
        }
      } else {
        reactionsData.all_reactions = reactionsData.all_reactions.filter(
          (r: any) => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
        if (reactionsData.positive_reactions) {
          reactionsData.positive_reactions = reactionsData.positive_reactions.filter(
            (r: any) => !(r.user?.email === currentUserEmail)
          );
        }

        const newReaction = {
          type: 'negativo',
          user: {
            email: currentUserEmail,
            name: userLogin.name,
            lastname: userLogin.lastname,
            image: userLogin.image
          },
          created_at: new Date().toISOString()
        };

        reactionsData.all_reactions.push(newReaction);
        if (reactionsData.negative_reactions) {
          reactionsData.negative_reactions.push(newReaction);
        }
      }
    }

    if (reactionType === 'comment' && this.commentReactionsData) {
      this.commentReactionsData.counts = {
        positive: reactionsData.positive_reactions?.length || 0,
        negative: reactionsData.negative_reactions?.length || 0,
        total: reactionsData.all_reactions.length
      };
    } else if (this.replayReactionsData) {
      this.replayReactionsData.counts = {
        positive: reactionsData.positive_reactions?.length || 0,
        negative: reactionsData.negative_reactions?.length || 0,
        total: reactionsData.all_reactions.length
      };
    }

    this.changeDetector.detectChanges();
  }
}