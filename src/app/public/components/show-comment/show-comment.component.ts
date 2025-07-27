import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    ButtonModule
  ],
  templateUrl: './show-comment.component.html',
  styleUrl: './show-comment.component.scss'
})
export class ShowCommentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly commentsService = inject(CommentsService);
  private readonly alertService = inject(AlertService);

  public idComentario!: string;
  public commentData: ViewCommentResponse | null = null;
  public loading = true;
  public activeImageIndex = 0;
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

  ngOnInit(): void {
    this.idComentario = this.route.snapshot.paramMap.get('id')!;
    this.loadComment();
  }

  loadComment(): void {
    this.loading = true;
    if (this.commentsService.getOpc === 'replayComment') {
      this.commentsService.viewResponseOfComment(this.idComentario).subscribe({
        next: (response) => {
          this.commentData = response;
          console.log(this.commentData);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    }else{
      this.commentsService.viewComment(this.idComentario).subscribe({
        next: (response) => {
          this.commentData = response;
          console.log(this.commentData);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    }

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

    switch(rangeName.toLowerCase()) {
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