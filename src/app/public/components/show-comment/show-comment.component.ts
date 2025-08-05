import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentsService } from '../../../core/services/Comments/comments.service';
import { ViewCommentResponse } from '../../../core/models/Comments/viewCommentResponse.interface';
import { Data } from '../../../core/models/Comments/responseOfComments.interface';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { AlertService } from '../../../shared/alerts/alert.service';
import { User } from '../../../core/models/Comments/createCommentInPost.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditCommentInPostI } from '../../../core/models/Comments/editCommentInPost.interface';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { PaginatorModule } from 'primeng/paginator';
import { ReactionsService } from '../../../core/services/Reactions/reactions.service';
import { ReactionsCommentResponseI } from '../../../core/models/Reactions/reactionsCommentResponse.interface';
import { ReactionsReplayCommentResponse } from '../../../core/models/Reactions/reactionsReplayCommentResponse.interface';
import { TabViewModule } from 'primeng/tabview';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'public-show-comment',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    TagModule,
    DividerModule,
    CardModule,
    ProgressSpinnerModule,
    GalleriaModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    FileUploadModule,
    PaginatorModule,
    TabViewModule,
    TextareaModule
  ],
  templateUrl: './show-comment.component.html',
  styleUrl: './show-comment.component.scss'
})
export class ShowCommentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly commentsService = inject(CommentsService);
  private readonly reactionsService = inject(ReactionsService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  public idComentario!: string;
  public idPublicacion!: string;
  public commentData: ViewCommentResponse | null = null;
  public loading = true;
  public activeImageIndex = 0;
  public objUser!: User;
  public editDialogVisible = false;
  public editForm!: FormGroup;
  public uploadedFiles: any[] = [];
  public isEditing = false;
  public rolUser!: string;

  // Respuestas
  public loadingResponses = false;
  public responses: any[] = [];
  public totalResponses = 0;
  public rows = 5;
  public currentPage = 1;

  // Nueva respuesta
  public newReplyText = '';
  public replyUploadedFiles: File[] = [];
  public replyPreviewImages: string[] = [];
  public postingReply = false;

  // Reacciones
  public displayCommentReactionsDialog = false;
  public loadingCommentReactions = false;
  public commentReactionsData: ReactionsCommentResponseI | null = null;
  public activeCommentReactionTab = 0;
  public reactingCommentId: string | null = null;

  public displayReplyReactionsDialog = false;
  public loadingReplyReactions = false;
  public replyReactionsData: ReactionsReplayCommentResponse | null = null;
  public activeReplyReactionTab = 0;
  public reactingReplyId: string | null = null;

  public responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor() {
    this.objUser = JSON.parse(localStorage.getItem('userLogin')!);
    this.rolUser = JSON.parse(localStorage.getItem('userLogin')!)?.roles[0]?.name;
    this.initEditForm();
  }

  private initEditForm(): void {
    this.editForm = this.fb.group({
      comment: [''],
      images: [null]
    });
  }

  ngOnInit(): void {
    this.idComentario = this.route.snapshot.paramMap.get('idComentario')!;
    this.idPublicacion = this.route.snapshot.paramMap.get('idPublicacion')!;
    this.loadComment();
    this.loadResponses();
    this.loadCommentReactions();
  }

  loadComment(): void {
    this.loading = true;
    if (this.commentsService.getOpc === 'replayComment') {
      this.commentsService.viewResponseOfComment(this.idComentario).subscribe({
        next: (response) => {
          this.commentData = response;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    } else {
      this.commentsService.viewComment(this.idComentario).subscribe({
        next: (response) => {
          this.commentData = response;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    }
  }

  loadResponses(page: number = 1): void {
    this.loadingResponses = true;
    this.commentsService.getsCommentsResponse(this.idComentario, page).subscribe({
      next: (response) => {
        this.responses = response.data.data;
        this.totalResponses = response.data.total;
        this.loadingResponses = false;
        
        // Cargar reacciones para cada respuesta
        this.responses.forEach(response => {
          this.loadReplyReactions(response.id);
        });
      },
      error: (err) => {
        this.loadingResponses = false;
        this.handleError(err);
      }
    });
  }

  loadCommentReactions(): void {
    if (!this.idComentario) return;
    this.loadingCommentReactions = true;
    this.reactionsService.getReactionsComment(this.idComentario).subscribe({
      next: (response) => {
        this.commentReactionsData = response;
        this.loadingCommentReactions = false;
      },
      error: (err) => {
        this.loadingCommentReactions = false;
        this.handleError(err);
      }
    });
  }

  loadReplyReactions(replyId: string): void {
    this.reactionsService.getReplayReactionsComment(replyId).subscribe({
      next: (response) => {
        const reply = this.responses.find(r => r.id === replyId);
        if (reply) {
          reply.reactionsData = response.data;
        }
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  postReply(): void {
    if (!this.newReplyText.trim() && this.replyUploadedFiles.length === 0) {
      this.alertService.miniAlert('La respuesta no puede estar vacía', 'warning', 3000);
      return;
    }

    this.postingReply = true;
    const formData = new FormData();
    formData.append('comment', this.newReplyText);

    this.replyUploadedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    this.commentsService.createReplayComment(
      this.idPublicacion,
      this.idComentario,
      formData
    ).subscribe({
      next: (response) => {
        this.alertService.miniAlert('Respuesta publicada', 'success', 2000);
        this.newReplyText = '';
        this.replyUploadedFiles = [];
        this.replyPreviewImages = [];
        this.postingReply = false;
        this.loadResponses();
      },
      error: (err) => {
        this.postingReply = false;
        this.handleError(err);
      }
    });
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

  reactToComment(type: 'positive' | 'negative'): void {
    if (this.reactingCommentId) return;
    this.reactingCommentId = this.idComentario;

    const hadPositive = this.hasReactedToComment('positive');
    const hadNegative = this.hasReactedToComment('negative');
    const isSameReaction = (type === 'positive' && hadPositive) || (type === 'negative' && hadNegative);

    // Guardar valores originales para posible reversión
    const originalPositive = this.commentData?.data?.positive_reactions_count || 0;
    const originalNegative = this.commentData?.data?.negative_reactions_count || 0;

    // Actualización visual inmediata
    if (type === 'positive') {
      if (hadPositive) {
        this.commentData!.data!.positive_reactions_count--;
      } else {
        this.commentData!.data!.positive_reactions_count++;
        if (hadNegative) {
          this.commentData!.data!.negative_reactions_count--;
        }
      }
    } else {
      if (hadNegative) {
        this.commentData!.data!.negative_reactions_count--;
      } else {
        this.commentData!.data!.negative_reactions_count++;
        if (hadPositive) {
          this.commentData!.data!.positive_reactions_count--;
        }
      }
    }

    // Actualizar lista de reacciones localmente
    this.updateLocalCommentReactionState(type, hadPositive, hadNegative);

    const action = isSameReaction ?
      this.reactionsService.removeReactionAComment(this.idComentario) :
      this.reactionsService.reactionsAComment(this.idComentario, type === 'positive' ? 'positivo' : 'negativo');

    action.subscribe({
      next: (response: any) => {
        if (response.data) {
          this.commentData!.data!.positive_reactions_count = response.data.counts.positive;
          this.commentData!.data!.negative_reactions_count = response.data.counts.negative;
          this.commentReactionsData = response;
        }
        this.reactingCommentId = null;
      },
      error: (err) => {
        // Revertir cambios
        if (this.commentData?.data) {
          this.commentData.data.positive_reactions_count = originalPositive;
          this.commentData.data.negative_reactions_count = originalNegative;
        }
        this.updateLocalCommentReactionState(type, hadPositive, hadNegative, true);
        this.handleError(err);
        this.reactingCommentId = null;
      }
    });
  }

  reactToReply(replyId: string, type: 'positive' | 'negative'): void {
    if (this.reactingReplyId === replyId) return;
    this.reactingReplyId = replyId;

    const reply = this.responses.find(r => r.id === replyId);
    if (!reply) return;

    const hadPositive = this.hasReactedToReply(replyId, 'positive');
    const hadNegative = this.hasReactedToReply(replyId, 'negative');
    const isSameReaction = (type === 'positive' && hadPositive) || (type === 'negative' && hadNegative);

    // Guardar valores originales para posible reversión
    const originalPositive = reply.positive_reactions_count || 0;
    const originalNegative = reply.negative_reactions_count || 0;

    // Actualización visual inmediata
    if (type === 'positive') {
      if (hadPositive) {
        reply.positive_reactions_count--;
      } else {
        reply.positive_reactions_count++;
        if (hadNegative) {
          reply.negative_reactions_count--;
        }
      }
    } else {
      if (hadNegative) {
        reply.negative_reactions_count--;
      } else {
        reply.negative_reactions_count++;
        if (hadPositive) {
          reply.positive_reactions_count--;
        }
      }
    }

    // Actualizar lista de reacciones localmente
    this.updateLocalReplyReactionState(replyId, type, hadPositive, hadNegative);

    const action = isSameReaction ?
      this.reactionsService.removeReactionAReplayComment(replyId) :
      this.reactionsService.reactionsAReplayComment(replyId, type === 'positive' ? 'positivo' : 'negativo');

    action.subscribe({
      next: (response: any) => {
        if (response.data) {
          reply.positive_reactions_count = response.data.counts.positive;
          reply.negative_reactions_count = response.data.counts.negative;
          reply.reactionsData = response.data;
        }
        this.reactingReplyId = null;
      },
      error: (err) => {
        // Revertir cambios
        reply.positive_reactions_count = originalPositive;
        reply.negative_reactions_count = originalNegative;
        this.updateLocalReplyReactionState(replyId, type, hadPositive, hadNegative, true);
        this.handleError(err);
        this.reactingReplyId = null;
      }
    });
  }

  private updateLocalCommentReactionState(
    type: 'positive' | 'negative',
    hadPositive: boolean,
    hadNegative: boolean,
    revert = false
  ): void {
    const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
    const currentUserEmail = userLogin.email;

    if (!this.commentReactionsData?.data?.all_reactions) return;

    if (revert) {
      // Forzar actualización de la vista
      return;
    }

    if (type === 'positive') {
      if (hadPositive) {
        // Quitar like
        this.commentReactionsData.data.all_reactions = this.commentReactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
      } else {
        // Agregar like
        this.commentReactionsData.data.all_reactions = this.commentReactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
        this.commentReactionsData.data.all_reactions.push({
          type: 'positivo',
          user: {
            email: currentUserEmail,
            name: userLogin.name,
            lastname: userLogin.lastname,
            image: userLogin.image
          },
          created_at: new Date().toISOString()
        } as any);
      }
    } else {
      if (hadNegative) {
        // Quitar dislike
        this.commentReactionsData.data.all_reactions = this.commentReactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
      } else {
        // Agregar dislike
        this.commentReactionsData.data.all_reactions = this.commentReactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
        this.commentReactionsData.data.all_reactions.push({
          type: 'negativo',
          user: {
            email: currentUserEmail,
            name: userLogin.name,
            lastname: userLogin.lastname,
            image: userLogin.image
          },
          created_at: new Date().toISOString()
        } as any);
      }
    }
  }

  private updateLocalReplyReactionState(
    replyId: string,
    type: 'positive' | 'negative',
    hadPositive: boolean,
    hadNegative: boolean,
    revert = false
  ): void {
    const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
    const currentUserEmail = userLogin.email;

    const reply = this.responses.find(r => r.id === replyId);
    if (!reply || !reply.reactionsData?.all_reactions) return;

    if (revert) {
      // Forzar actualización de la vista
      return;
    }

    if (type === 'positive') {
      if (hadPositive) {
        // Quitar like
        reply.reactionsData.all_reactions = reply.reactionsData.all_reactions.filter(
          (r:any) => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
      } else {
        // Agregar like
        reply.reactionsData.all_reactions = reply.reactionsData.all_reactions.filter(
          (r:any) => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
        reply.reactionsData.all_reactions.push({
          type: 'positivo',
          user: {
            email: currentUserEmail,
            name: userLogin.name,
            lastname: userLogin.lastname,
            image: userLogin.image
          },
          created_at: new Date().toISOString()
        } as any);
      }
    } else {
      if (hadNegative) {
        // Quitar dislike
        reply.reactionsData.all_reactions = reply.reactionsData.all_reactions.filter(
          (r:any)  => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
      } else {
        // Agregar dislike
        reply.reactionsData.all_reactions = reply.reactionsData.all_reactions.filter(
          (r:any) => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
        reply.reactionsData.all_reactions.push({
          type: 'negativo',
          user: {
            email: currentUserEmail,
            name: userLogin.name,
            lastname: userLogin.lastname,
            image: userLogin.image
          },
          created_at: new Date().toISOString()
        } as any);
      }
    }
  }

  hasReactedToComment(type: 'positive' | 'negative'): boolean {
    try {
      const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
      const currentUserEmail = userLogin.email;

      if (!this.commentReactionsData?.data?.all_reactions) {
        return false;
      }

      return this.commentReactionsData.data.all_reactions.some(
        r => r?.user?.email === currentUserEmail && 
             r.type === (type === 'positive' ? 'positivo' : 'negativo')
      );
    } catch (error) {
      console.error('Error checking comment reaction:', error);
      return false;
    }
  }

  hasReactedToReply(replyId: string, type: 'positive' | 'negative'): boolean {
    try {
      const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
      const currentUserEmail = userLogin.email;

      const reply = this.responses.find(r => r.id === replyId);
      if (!reply || !reply.reactionsData?.all_reactions) {
        return false;
      }

      return reply.reactionsData.all_reactions.some(
        (r:any) => r?.user?.email === currentUserEmail && 
             r.type === (type === 'positive' ? 'positivo' : 'negativo')
      );
    } catch (error) {
      console.error('Error checking reply reaction:', error);
      return false;
    }
  }

  showCommentReactionsDialog(): void {
    this.displayCommentReactionsDialog = true;
    this.loadCommentReactions();
  }

  showReplyReactionsDialog(replyId: string): void {
    this.displayReplyReactionsDialog = true;
    this.loadingReplyReactions = true;
    
    this.reactionsService.getReplayReactionsComment(replyId).subscribe({
      next: (response) => {
        this.replyReactionsData = response;
        this.loadingReplyReactions = false;
      },
      error: (err) => {
        this.loadingReplyReactions = false;
        this.handleError(err);
      }
    });
  }

  showEditDialog(): void {
    this.editForm.patchValue({
      comment: this.commentData?.data?.comment
    });
    this.editDialogVisible = true;
  }

  onUpload(event: any): void {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  editComment(): void {
    if (this.editForm.invalid) return;

    this.isEditing = true;
    const formData = new FormData();
    formData.append('comment', this.editForm.get('comment')?.value);

    if (this.uploadedFiles.length > 0) {
      for (let file of this.uploadedFiles) {
        formData.append('images[]', file);
      }
    }

    this.commentsService.editCommentInPost(this.idPublicacion, this.idComentario, formData).subscribe({
      next: (response: any) => {
        this.alertService.miniAlert('Comentario actualizado correctamente', 'success', 2000);
        this.commentData!.data = response.data;
        this.editDialogVisible = false;
        this.uploadedFiles = [];
        this.isEditing = false;
      },
      error: (err) => {
        this.isEditing = false;
        this.handleError(err);
      }
    });
  }

  deleteComment(): void {
    const baseRoute = this.router.url.split('?')[0];
    const segments = baseRoute.split('/');

    this.alertService.alertwithDialogs('Estás seguro que deseas eliminar este comentario?', 'Después no podrás revertir esta acción', 'warning', 3000, (() => {
      if (this.commentsService.getOpc === 'replayComment') {
        this.commentsService.deleteReplayComment(this.idComentario).subscribe({
          next: (s) => {
            this.alertService.miniAlert('El comentario se eliminó correctamente', 'success', 3000);
            this.location.back();
          },
          error: (err) => {
            this.handleError(err);
          }
        });
      } else {
        this.commentsService.deleteComment(this.idComentario).subscribe({
          next: (s) => {
            this.alertService.miniAlert('El comentario se eliminó correctamente', 'success', 3000);
            this.location.back();
          },
          error: (err) => {
            this.handleError(err);
          }
        });
      }
    }));
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error?.message || 'Error al cargar el comentario', 'error', 3000);
    }
  }

  getRangeSeverity(rangeName: string | undefined): any {
    if (!rangeName) return 'info';
    switch (rangeName.toLowerCase()) {
      case 'novato': return 'info';
      case 'aprendiz': return 'success';
      case 'iniciado': return 'warning';
      case 'experto': return 'danger';
      default: return 'info';
    }
  }

  getAvatarLabel(user: any): string {
    if (user.image?.url) return '';
    return (user.name.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }

  // Ir a respuesta de comentario por el idComentario

  goReplayComment(idReplayComment:string){
    this.router.navigate(['menu/respuesta-comentario', idReplayComment])
  }

  closeEditDialog(): void {
    this.editDialogVisible = false;
    this.uploadedFiles = [];
  }

  // Ir al perfil de usuario por ID 

  goProfileByID(idUsuario:string){
    this.router.navigate(['menu/perfil', idUsuario]);
  }
}