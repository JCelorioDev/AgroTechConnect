import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../core/services/Post/post.service';
import { Data } from '../../../core/models/Post/showPostResponse.interface';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../shared/alerts/alert.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GalleriaModule } from 'primeng/galleria';
import { DomSanitizer } from '@angular/platform-browser';
import { CommentsComponent } from '../comments/comments.component';
import { ReactionsService } from '../../../core/services/Reactions/reactions.service';
import { Data as DataReactions, ReactionsResponseI } from '../../../core/models/Reactions/reactionsResponse.interface';
import { TabViewModule } from 'primeng/tabview';


@Component({
  selector: 'app-show-post',
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
    CommentsComponent,
    TabViewModule
  ],
  templateUrl: './show-post.component.html',
  styleUrls: ['./show-post.component.scss']
})
export class ShowPostComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  private readonly reactionservice = inject(ReactionsService)
  private readonly alertService = inject(AlertService);
  private readonly domSanitizer = inject(DomSanitizer );
  public listReactionsPost!:DataReactions;

  public idPublicacion!: string;
  public objPublication!: Data;
  public loading = true;
  public displayCommentsDialog = false;
  public activeImageIndex = 0;


  public displayReactionsDialog = false;
  public loadingReactions = false;
  public reactionsData: ReactionsResponseI | null = null;
  public activeReactionTab = 0;


  
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
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    this.loadPublication();
    this.reactionservice.getsReactionsPost(this.idPublicacion).subscribe({
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

  loadPublication(): void {
    this.loading = true;
    this.postService.showPost(this.idPublicacion).subscribe({
      next: (response) => {
        this.objPublication = response.data;
        // Initialize comments array if not present
        if (!this.objPublication.comments) {
          this.objPublication.comments = [];
        }
        this.loading = false;
        console.log(this.objPublication.created_at);
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error.message, 'error', 3000);
    }
  }

  // Añade esta función para manejar el cierre del diálogo
  closeCommentsDialog(): void {
    this.displayCommentsDialog = false;
  }

  // Modifica la función toggleCommentsDialog
  toggleCommentsDialog(): void {
    this.displayCommentsDialog = !this.displayCommentsDialog;
  }
  getRangeSeverity(rangeName: string | undefined): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    if (!rangeName) return 'info';

    switch(rangeName) {
      case 'Novato': return 'info';
      case 'Aprendiz': return 'success';
      case 'Iniciado': return 'warn';
      case 'Experto': return 'danger';
      default: return 'info';
    }
  }

  getAvatarLabel(user: any): string {
    if (!user) return '';
    if (user.image?.url) return '';

    // Return initials if no image
    const name = user.name || '';
    const lastname = user.lastname || '';
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  }

  sanitizeHtml(html: string) {
    const cleaned = html
      .replace(/<\/?span[^>]*>/g, '')
      .replace(/<(\w+)[^>]*>/g, '<$1>');

    return this.domSanitizer.bypassSecurityTrustHtml(cleaned);
  }


  // Ver las reacciones de una publicacion

  showReactionsDialog(): void {
    this.displayReactionsDialog = true;
    this.loadingReactions = true;
    
    this.reactionservice.getsReactionsPost(this.idPublicacion).subscribe({
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

    // Método auxiliar para contar reacciones por tipo
    countReactionsByType(type: string): number {
      if (!this.reactionsData?.data.all_reactions) return 0;
      return this.reactionsData.data.all_reactions.filter(r => r.type === type).length;
    }

    
    hasReacted(reactionType: string): boolean {
      try {
        const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
        const currentUserEmail = userLogin.email;
    
        if (!currentUserEmail || !this.reactionsData?.data?.all_reactions) {
          return false;
        }
    
        // Usamos un for...of para poder hacer return inmediato
        for (const reaction of this.reactionsData.data.all_reactions) {
          if (reaction?.user?.email === currentUserEmail && reaction.type === reactionType) {
            console.log(`✅ Usuario ${currentUserEmail} tiene ${reactionType}`); // Debug
            return true; // Sale inmediatamente si encuentra coincidencia
          }
        }
    
        return false; // Si no encontró ninguna coincidencia
      } catch (error) {
        console.error('Error checking reaction:', error);
        return false;
      }
    }
    


}