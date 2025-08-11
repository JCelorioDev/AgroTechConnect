import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentsService } from '../../../core/services/Comments/comments.service';
import { ViewCommentResponse } from '../../../core/models/Comments/viewCommentResponse.interface';
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
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { PaginatorModule } from 'primeng/paginator';
import { ReactionsService } from '../../../core/services/Reactions/reactions.service';
import { ReactionsReplayCommentResponse } from '../../../core/models/Reactions/reactionsReplayCommentResponse.interface';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-show-replay-comment',
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
    TabViewModule
  ],
  templateUrl: './show-replay-comment.component.html',
  styleUrl: './show-replay-comment.component.scss'
})
export class ShowReplayCommentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly commentsService = inject(CommentsService);
  private readonly reactionsService = inject(ReactionsService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  public idReplayComment!: string;
  public idPublicacion!: string;
  public idCommentParent!: string;
  public commentData: ViewCommentResponse | null = null;
  public loading = true;
  public activeImageIndex = 0;
  public objUser!: User;
  public rolUser!: string;

  // Reacciones
  public displayReactionsDialog = false;
  public loadingReactions = false;
  public reactionsData: ReactionsReplayCommentResponse | null = null;
  public activeReactionTab = 0;
  public reactingId: string | null = null;

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
    this.rolUser = JSON.parse(localStorage.getItem('userLogin') || 'null')?.roles?.[0]?.name || '';
  }

  ngOnInit(): void {
    this.idReplayComment = this.route.snapshot.paramMap.get('idReplayComment')!;
    this.idPublicacion = this.route.snapshot.paramMap.get('idPublicacion')!;
    this.idCommentParent = this.route.snapshot.paramMap.get('idCommentParent')!;
    this.loadComment();
    this.loadReactions();
  }

  loadComment(): void {
    this.loading = true;
    this.commentsService.viewResponseOfComment(this.idReplayComment).subscribe({
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

  loadReactions(): void {
    if (!this.idReplayComment) return;
    this.loadingReactions = true;
    this.reactionsService.getReplayReactionsComment(this.idReplayComment).subscribe({
      next: (response) => {
        this.reactionsData = response;
        this.loadingReactions = false;
      },
      error: (err) => {
        this.loadingReactions = false;
        this.handleError(err);
      }
    });
  }

  reactToComment(type: 'positive' | 'negative'): void {
    if (this.reactingId) return;
    this.reactingId = this.idReplayComment;

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
    this.updateLocalReactionState(type, hadPositive, hadNegative);

    const action = isSameReaction ?
      this.reactionsService.removeReactionAReplayComment(this.idReplayComment) :
      this.reactionsService.reactionsAReplayComment(this.idReplayComment, type === 'positive' ? 'positivo' : 'negativo');

    action.subscribe({
      next: (response: any) => {
        if (response.data) {
          this.commentData!.data!.positive_reactions_count = response.data.counts.positive;
          this.commentData!.data!.negative_reactions_count = response.data.counts.negative;
          this.reactionsData = response;
        }
        this.reactingId = null;
      },
      error: (err) => {
        // Revertir cambios
        if (this.commentData?.data) {
          this.commentData.data.positive_reactions_count = originalPositive;
          this.commentData.data.negative_reactions_count = originalNegative;
        }
        this.updateLocalReactionState(type, hadPositive, hadNegative, true);
        this.handleError(err);
        this.reactingId = null;
      }
    });
  }

  private updateLocalReactionState(
    type: 'positive' | 'negative',
    hadPositive: boolean,
    hadNegative: boolean,
    revert = false
  ): void {
    const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
    const currentUserEmail = userLogin.email;

    if (!this.reactionsData?.data?.all_reactions) return;

    if (revert) {
      return;
    }

    if (type === 'positive') {
      if (hadPositive) {
        // Quitar like
        this.reactionsData.data.all_reactions = this.reactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
      } else {
        // Agregar like
        this.reactionsData.data.all_reactions = this.reactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
        this.reactionsData.data.all_reactions.push({
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
        this.reactionsData.data.all_reactions = this.reactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'negativo')
        );
      } else {
        // Agregar dislike
        this.reactionsData.data.all_reactions = this.reactionsData.data.all_reactions.filter(
          r => !(r.user?.email === currentUserEmail && r.type === 'positivo')
        );
        this.reactionsData.data.all_reactions.push({
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

      if (!this.reactionsData?.data?.all_reactions) {
        return false;
      }

      return this.reactionsData.data.all_reactions.some(
        r => r?.user?.email === currentUserEmail &&
             r.type === (type === 'positive' ? 'positivo' : 'negativo')
      );
    } catch (error) {
      console.error('Error checking reaction:', error);
      return false;
    }
  }

  showReactionsDialog(): void {
    this.displayReactionsDialog = true;
    this.loadReactions();
  }

  deleteComment(): void {
    this.alertService.alertwithDialogs('Estás seguro que deseas eliminar esta respuesta?', 'Después no podrás revertir esta acción', 'warning', 3000, (() => {
      this.commentsService.deleteReplayComment(this.idReplayComment).subscribe({
        next: (s) => {
          this.alertService.miniAlert('La respuesta se eliminó correctamente', 'success', 3000);
          this.location.back();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }));
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error?.message || 'Error al cargar la respuesta', 'error', 3000);
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
}