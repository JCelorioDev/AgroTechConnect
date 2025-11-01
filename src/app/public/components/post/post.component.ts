import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { PostService } from '../../../core/services/Post/post.service';
import { Datum } from '../../../core/models/Post/postRespone.interface';
import { AlertService } from '../../../shared/alerts/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, combineLatest, filter } from 'rxjs';
import { User } from '../../../core/models/Post/addedPost.interface';
import { Dialog } from 'primeng/dialog';
import { Data } from '../../../core/models/Post/showPostResponse.interface';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'public-post',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    AvatarModule,
    DividerModule,
    ProgressSpinnerModule,
    PaginatorModule,
    Dialog,
    LottieComponent
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent implements OnInit, OnDestroy {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly domSanitizer = inject(DomSanitizer );

  public validation: boolean = false;
  public msjValidation: string = '';
  public userLogin = signal<User | null>(null);
  public visible: boolean = false;
  public listPost: Datum[] = [];
  public loading = true;
  public totalRecords = 0;
  public currentPage = 1;

  private segments!: string[];
  private idPublication!: string;
  private destroy$ = new Subject<void>();
  private isHandlingNewPost = false;
  private searchQuery: string = '';
  private yearFilter: number | null = null;
  private monthFilter: number | null = null;
  public post!:Data;
  public emailPostUser = signal<string>("");

  options: any = {
    path: 'anim/chicky_animation.json',
  };

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.verifyRoute();
    });

    combineLatest([
      this.postService.searchQuery$.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.postService.filters$.pipe(
        distinctUntilChanged()
      )
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([query, filters]) => {
      this.searchQuery = query;
      this.yearFilter = filters.year;
      this.monthFilter = filters.month;
      this.currentPage = 1;
      this.updateUrl();
      this.verifyRoute();
    });

    this.postService.newPost$.pipe(
      filter(newPost => newPost !== null),
      takeUntil(this.destroy$)
    ).subscribe(newPost => {
      this.isHandlingNewPost = true;
      this.handleNewPost(newPost!);
      this.isHandlingNewPost = false;
    });
  }

  private handleNewPost(newPost: any): void {
    if (this.segments[2] === 'mis-publicaciones') {
      this.listPost.unshift(newPost);
      this.totalRecords++;

      // Mantenemos solo los posts que caben en la página actual
      if (this.listPost.length > 10) {
        this.listPost.pop();
      }
    } else {
      // Para el feed público solo actualizamos si estamos en página 1
      if (this.currentPage === 1) {
        this.listPost.unshift(newPost);
        this.totalRecords++;

        if (this.listPost.length > 10) {
          this.listPost.pop();
        }
      }
    }
  }

  public nameError!:string;

  verifyRoute(): void {
    const baseRoute = this.router.url.split('?')[0];
    this.segments = baseRoute.split('/');

    this.userLogin.set(JSON.parse(localStorage.getItem('userLogin')!));
    const hasToken = this.userLogin() ? !!this.userLogin()?.token : false;



    if (this.route.snapshot.paramMap.get('id')){
      this.getPostsByUser(
      this.route.snapshot.paramMap.get('id')!);
    } else if (this.segments[2] === 'publicaciones') {
      this.nameError = this.segments[2]
      this.getPosts();
    } else if (this.segments[2] === 'comunidad') {
      this.nameError = this.segments[2]
      this.getPostsMyFollowings();
    } else {
      if (!hasToken) {
        this.validation = true;
        this.loading = false;
        this.msjValidation = 'Ingresa una cuenta primero para realizar una publicación.';
        return;
      }
      this.getsMePost();
    }
  }

  getPosts(): void {
    if (!this.isHandlingNewPost) {
      this.loading = true;
    }
    this.listPost = [];

    this.postService.getsPost(
      this.currentPage,
      10,
      this.searchQuery,
      this.yearFilter,
      this.monthFilter
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.listPost = response.data.data;
        // Inicializa el estado en tus métodos de carga de posts (getPosts(), getsMePost(), etc.)
        this.listPost.forEach(post => {
          if (post.images?.length > 0) {
            this.imageLoaded[post.id] = false; // Inicia como no cargada
          }
        });
        this.totalRecords = response.data.total;
        this.loading = false;

        if ((this.searchQuery || this.yearFilter || this.monthFilter) && this.listPost.length === 0) {
          this.alertService.miniAlert('No se encontraron publicaciones con los filtros aplicados', 'info', 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }

  public notHasPost:boolean = false;

  getsMePost(): void {
    if (!this.isHandlingNewPost) {
      this.loading = true;
    }

    this.postService.getsMePost(
      this.currentPage,
      10,
      this.searchQuery,
      this.yearFilter,
      this.monthFilter
    ).subscribe({
      next: (response) => {
        this.listPost = response.data.data;
        // Inicializa el estado en tus métodos de carga de posts (getPosts(), getsMePost(), etc.)
        this.listPost.forEach(post => {
          if (post.images?.length > 0) {
            this.imageLoaded[post.id] = false; // Inicia como no cargada
          }
        });
        this.totalRecords = response.data.total;
        this.loading = false;
        this.validation = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else if (err.status === 404) {
          this.alertService.miniAlert('No tienes publicaciones aún', 'warning', 3000);
          this.msjValidation = 'Crea tu primera publicación.';
          this.validation = true;
          this.loading = false;
          this.notHasPost = true;
          return;
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }

  // Obtener publicaciones de un usuario en especifico

  getPostsByUser(idPublication:string): void {
    if (!this.isHandlingNewPost) {
      this.loading = true;
    }


    this.listPost = [];

    this.postService.getPublicationbyID(
      this.currentPage,
      10,
      this.searchQuery,
      this.yearFilter,
      this.monthFilter,
      idPublication
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.listPost = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
        this.listPost.forEach(post => {
          if (post.images?.length > 0) {
            this.imageLoaded[post.id] = false; // Inicia como no cargada
          }
        });

        if ((this.searchQuery || this.yearFilter || this.monthFilter) && this.listPost.length === 0) {
          this.alertService.miniAlert('No se encontraron publicaciones con los filtros aplicados', 'info', 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }

  public notToken !:boolean;

  // Obtener publicaciones de mis seguidos

  getPostsMyFollowings():void{
      if (!this.isHandlingNewPost) {
        this.loading = true;
      }

      if (!this.userLogin()?.token) {
        this.notToken = true;
      } else {
        this.listPost = [];

        this.postService.getPostMeFollowings(
          this.currentPage,
          10,
          this.searchQuery,
          this.yearFilter,
          this.monthFilter
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.listPost = response.data.data;
            this.listPost.forEach(post => {
              if (post.images?.length > 0) {
                this.imageLoaded[post.id] = false; // Inicia como no cargada
              }
            });
            this.totalRecords = response.data.total;
            this.loading = false;

            if ((this.searchQuery || this.yearFilter || this.monthFilter) && this.listPost.length === 0) {
              this.alertService.miniAlert('No se encontraron publicaciones con los filtros aplicados', 'info', 2000);
            }


          },
          error: (err) => {
            this.loading = false;
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            } else if (err.status == 404){
              this.validation = true;
              this.options.path = 'anim/world_animation.json'
              this.msjValidation = 'Comienza a seguir para hacer conexión con los demás.'
            }
            else {
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        });
      }
  }



  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.updateUrl();

    if (this.segments[2] === 'publicaciones') {
      this.getPosts();
    } else {
      this.getsMePost();
    }
  }

  trackByPostId(index: number, post: Datum): string {
    return post.id;
  }

  getRangeSeverity(rangeName: string | undefined): any {
    if (!rangeName) return 'info';

    switch(rangeName) {
      case 'Novato': return 'info';
      case 'Aprendiz': return 'success';
      case 'Iniciado': return 'warning';
      case 'Experto': return 'danger';
      default: return 'info';
    }
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge'
    });
  }

  setIdPublication(idPublication: string, email?:string): void {
    this.emailPostUser.set(email!);
    this.idPublication = idPublication;
  }

  deletePost() {
    this.visible = false;

    this.alertService.alertwithDialogs(
      '¿Estás seguro de eliminar la publicación?',
      'Después no podrás revertir esta acción.',
      'warning',
      3000,
      (() => {
        this.loading = true;
        this.postService.deleteMePost(this.idPublication).subscribe({
          next: (s) => {
            this.alertService.miniAlert('La publicación se eliminó correctamente.', 'success', 3000);

            const index = this.listPost.findIndex(post => post.id === this.idPublication);
            if (index !== -1) {
              this.listPost.splice(index, 1);
              this.totalRecords--;

              if (this.listPost.length === 0 && this.currentPage === 1) {
                this.msjValidation = 'Crea tu primera publicación.';
                this.validation = true;
              }

              if (this.listPost.length === 0 && this.currentPage > 1) {
                this.currentPage--;
                this.updateUrl();
              }
            }

            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            } else {
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Ir al perfil de un usuario en especifico

  goPerfilUser(idUser:string):void{
    this.router.navigate(['menu/perfil', idUser]);
  }

  // Editar publicacion

  editPost():void{
    this.router.navigate(['menu/modificar-publicacion', this.idPublication]);
  }

  // Reportar una publicacion

  reportPublication():void{
    if (!this.userLogin()) {
      this.alertService.miniAlert('Inicia sesión primero para reportar esta publicación.', 'warning', 3000); return;
    }

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

        this.alertService.alertwithDialogs('Estás seguro de reportar esta publicación.', 'Después no podrás revertir esta acción', 'warning', 3000, (() => {
          this.loading = true;
          this.postService.reportPublication(this.idPublication, description).subscribe({
            next: (s) => {
              this.alertService.alertDefault('La publicación se ha reportado exitosamente, un administrador revisará el caso.');
              this.loading = false;
            },
            error: (err) => {
              this.loading = false;
              if (err.status === 422) {
                this.alertService.showValidationErrors(err.error);
              } else {
                this.alertService.miniAlert(err.error.message, 'error', 3000);
              }
            }
          })
        }), 'No, deseo.', 'Si, deseo');
      }
    });
  }

  get userRole(): string {
    return this.userLogin()?.roles?.[0]?.name || '';
  }

  // Ir para ver una publicacion

  goShowPost(idPublicacion:string):void{
    this.router.navigate(['menu/mostrar-publicacion', idPublicacion])
  }

  sanitizeHtml(html: string) {
    const cleaned = html
      .replace(/<\/?span[^>]*>/g, '')
      .replace(/<(\w+)[^>]*>/g, '<$1>');

    return this.domSanitizer.bypassSecurityTrustHtml(cleaned);
  }

  getInitials(user: any): string {
    if (!user) return '';

    // Obtener la primera letra del nombre
    const firstNameInitial = user.name ? user.name.charAt(0).toUpperCase() : '';

    // Obtener la primera letra del apellido (si existe)
    const lastNameInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : '';

    return `${firstNameInitial}${lastNameInitial}`;
  }

  styles: Partial<CSSStyleDeclaration> = {
    maxWidth: '500px',
    margin: '0 auto',
  };

  goToLogin(): void {
    this.router.navigate(['menu/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  goToPost():void{
    this.router.navigate(['menu/publicaciones']);
  }

  public imageLoaded: { [key: string]: boolean } = {};

  // Método para manejar la carga de imágenes
  setImageLoaded(postId: string) {
    setTimeout(() => {
      this.imageLoaded[postId] = true;
    }, 2000); // 2 segundos de delay para testing
  }

}
