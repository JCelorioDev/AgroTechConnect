import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../core/services/Post/post.service';
import { Data } from '../../../core/models/Post/showPostResponse.interface';
import { ActivatedRoute, Router } from '@angular/router';
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
import Swal from 'sweetalert2';
import { User } from '../../../core/models/Comments/commentsPublicationResponse.interface';

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
  private readonly reactionservice = inject(ReactionsService);
  private readonly alertService = inject(AlertService);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  public listReactionsPost!: DataReactions;

  public idPublicacion!: string;
  public objPublication!: Data;
  public loading = true;
  public displayCommentsDialog = true;
  public activeImageIndex = 0;
  public displayReactionsDialog = false;
  public loadingReactions = false;
  public reactionsData: ReactionsResponseI | null = null;
  public activeReactionTab = 0;
  public isReacting = false;
  public rolUser!:string;
  public objUser !:User;

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
    this.rolUser = JSON.parse(localStorage.getItem('userLogin') || 'null')?.roles?.[0]?.name || '';
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    this.loadPublication();
    this.loadReactions();
    this.objUser = JSON.parse(localStorage.getItem('userLogin')!);
  }

  loadPublication(): void {
    this.loading = true;
    this.postService.showPost(this.idPublicacion).subscribe({
      next: (response) => {
        this.objPublication = response.data;
        // Formatear la fecha si es necesario
        if (this.objPublication.created_at) {
          this.objPublication.created_at = this.formatDate(this.objPublication.created_at);
        }
        if (!this.objPublication.comments) {
          this.objPublication.comments = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }


  loadReactions(): void {
    this.loadingReactions = true;
    this.reactionservice.getsReactionsPost(this.idPublicacion).subscribe({
      next: (response) => {
        this.reactionsData = response;
        // Formatear las fechas de las reacciones
        if (this.reactionsData?.data?.all_reactions) {
          this.reactionsData.data.all_reactions.forEach(reaction => {
            reaction.created_at = this.formatDate(reaction.created_at);
          });
        }
        if (this.reactionsData?.data?.positive_reactions) {
          this.reactionsData.data.positive_reactions.forEach(reaction => {
            reaction.created_at = this.formatDate(reaction.created_at);
          });
        }
        if (this.reactionsData?.data?.negative_reactions) {
          this.reactionsData.data.negative_reactions.forEach(reaction => {
            reaction.created_at = this.formatDate(reaction.created_at);
          });
        }
        this.loadingReactions = false;
      },
      error: (err) => {
        this.loadingReactions = false;
        this.handleError(err);
      }
    });
  }


  private formatDate(dateString: string): string {
    if (!dateString) return '';

    // Si ya está en formato ISO (como '2025-07-30T06:47:00Z'), lo dejamos igual
    if (dateString.includes('T') && dateString.includes('Z')) {
      return dateString;
    }

    // Si está en formato '30/07/2025 06:47', lo convertimos a ISO
    if (dateString.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      return `${year}-${month}-${day}T${timePart}:00Z`;
    }

    return dateString;
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error.message, 'error', 3000);
    }
  }

  closeCommentsDialog(): void {
    this.displayCommentsDialog = false;
  }

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

  showReactionsDialog(): void {
    this.displayReactionsDialog = true;
    this.loadReactions();
  }

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

      return this.reactionsData.data.all_reactions.some(
        r => r?.user?.email === currentUserEmail && r.type === reactionType
      );
    } catch (error) {
      console.error('Error checking reaction:', error);
      return false;
    }
  }

  reactionAPost(type: string): void {
    if (this.isReacting) return;
    if (!this.objUser) return ;
    this.isReacting = true;

    const hadPositive = this.hasReacted('positivo');
    const hadNegative = this.hasReacted('negativo');
    const isSameReaction = (type === 'positivo' && hadPositive) || (type === 'negativo' && hadNegative);

    // Guardar los valores originales para posible reversión
    const originalPositiveCount = this.objPublication.positive_reactions_count;
    const originalNegativeCount = this.objPublication.negative_reactions_count;

    // Actualización visual inmediata (incluyendo contadores)
    if (type === 'positivo') {
      if (hadPositive) {
        // Quitar like
        this.objPublication.positive_reactions_count--;
      } else {
        // Agregar like
        this.objPublication.positive_reactions_count++;
        if (hadNegative) {
          this.objPublication.negative_reactions_count--;
        }
      }
    } else if (type === 'negativo') {
      if (hadNegative) {
        // Quitar dislike
        this.objPublication.negative_reactions_count--;
      } else {
        // Agregar dislike
        this.objPublication.negative_reactions_count++;
        if (hadPositive) {
          this.objPublication.positive_reactions_count--;
        }
      }
    }

    // Actualizar lista de reacciones localmente
    this.updateLocalReactionState(type, hadPositive, hadNegative);

    // Determinar si es para agregar o quitar reacción
    const action = isSameReaction ?
      this.reactionservice.removeReactionAPost(this.idPublicacion) :
      this.reactionservice.reactionsAPost(this.idPublicacion, type);

    action.subscribe({
      next: (response: any) => {
        // Actualizar con datos reales del servidor
        if (response && response.data) {
          // Verificar si la respuesta tiene la estructura esperada
          if (response.data.counts) {
            this.objPublication.positive_reactions_count = response.data.counts.positive || this.objPublication.positive_reactions_count;
            this.objPublication.negative_reactions_count = response.data.counts.negative || this.objPublication.negative_reactions_count;
          }

          // Actualizar lista completa de reacciones solo si existe
          if (response.data.all_reactions) {
            this.reactionsData = response.data;
          }
        } else {
          // Si no hay data en la respuesta, recargar las reacciones
          this.loadReactions();
        }

        this.isReacting = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        // Revertir cambios si hay error
        this.objPublication.positive_reactions_count = originalPositiveCount;
        this.objPublication.negative_reactions_count = originalNegativeCount;
        this.updateLocalReactionState(type, hadPositive, hadNegative, true);
        this.handleError(err);
        this.isReacting = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  private updateLocalReactionState(
    type: string,
    hadPositive: boolean,
    hadNegative: boolean,
    revert = false
  ): void {
    const userLogin = JSON.parse(localStorage.getItem('userLogin') || '{}');
    const currentUserEmail = userLogin.email;

    if (!this.reactionsData?.data.all_reactions) return;

    if (revert) {
      // Forzar actualización del estado original
      this.changeDetector.detectChanges();
      return;
    }

    // Lógica para actualizar el estado visual localmente
    if (type === 'positivo') {
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
    } else if (type === 'negativo') {
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

    this.changeDetector.detectChanges();
  }

  // Ir al perfil de usuario por ID

  goProfileByID(idUsuario:string){
    this.router.navigate(['menu/perfil', idUsuario]);
  }

  scrollToComments(): void {
    const commentsSection = document.querySelector('.comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  reportPost(event: Event): void {
    event.stopPropagation();

    Swal.fire({
      title: 'Reportar publicación',
      input: 'textarea',
      inputPlaceholder: 'Describe el motivo de tu reporte...',
      inputAttributes: {
        'aria-label': 'Escribe tu descripción aquí'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar reporte',
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

        this.postService.reportPublication(this.idPublicacion, description).subscribe({
          next: () => {
            this.alertService.miniAlert('El reporte se realizó correctamente.', 'success', 3000);
          },
          error: (err) => {
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            } else {
              this.alertService.miniAlert(err.error?.message || 'Ocurrió un error al reportar', 'error', 3000);
            }
          }
        });
      }
    });
  }

  // Eliminar publicacion por admin

  eliminatePostAdmin():void{
    this.alertService.alertwithDialogs('¿Estás seguro de eliminar esta publicación', 'Déspues no podrás revertir esta acción', 'warning', 3000, (() => {
      this.postService.deleteMePost(this.idPublicacion).subscribe({
        next: (s) => {
          this.router.navigate(['menu/publicaciones']);
          this.alertService.miniAlert('La publicaciíon se eliminó correctamente','success', 3000);
        },
        error: (err) => {
          if (err.status === 422) {
            this.alertService.showValidationErrors(err.error);
          } else {
            this.alertService.miniAlert(err.error?.message || 'Ocurrió un error al reportar', 'error', 3000);
          }
        }
      })
    }), 'No, deseo.', 'Si, deseo.');
  }

  // Ir para modificar publicacion

  goEditPost():void{
    this.router.navigate(['menu/modificar-publicacion', this.idPublicacion]);
  }
}