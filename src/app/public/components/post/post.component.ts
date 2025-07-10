import { Component, inject, OnInit } from '@angular/core';
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


@Component({
  selector: 'public-post',
  imports: [    
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    AvatarModule,
    DividerModule,
    ProgressSpinnerModule,
    PaginatorModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public validation:boolean = false; // Variable para saber si tiene publicaciones el usuario o no tiene una cuenta activa
  public msjValidation:string = ''; // Variable para saber el msj de la validacion

  listPost: Datum[] = [];
  loading = true;
  totalRecords = 0;
  currentPage = 1;
  private currentRoute!:string;
  private segments!:string[];
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.verifyRoute()
    });
  }

  // Verificar ruta si estoy en publicaciones o mis publicaciones

  verifyRoute(): void {
    this.currentRoute = this.router.url;
    this.segments = this.currentRoute.split('/');

    if(this.segments[2] === 'publicaciones'){
      this.getPosts();
    }else{
      const userLogin = localStorage.getItem('userLogin');
      const hisToken = userLogin ? !!JSON.parse(userLogin)?.token : false;
      if(!hisToken){
        this.validation = true;
        this.loading = false;
        this.msjValidation = 'Ingresa una cuenta primero para realizar una publicación.'
        this.alertService.miniAlert('Ingresa una cuenta primero', 'warning', 3000); return;
      }
      this.getsMePost();
    }

  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.updateUrl();
    


    if(this.segments[2] === 'publicaciones'){
      this.getPosts();
    }else{
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

  // Obtener las publicaciones

  getPosts(): void {

    this.postService.getsPost(this.currentPage).subscribe({
      next: (response) => {
        this.listPost = response.data.data;
        this.totalRecords = response.data.total;
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
  }

  // Obtener mis publicaciones

  getsMePost():void{

    this.postService.getsMePost(this.currentPage).subscribe({
      next: (response) => {
        // Verificamos si tiene al menos una publicacion
        if(response.data.data.length === 0){
          this.alertService.miniAlert('No tienes publicaciones aún', 'warning', 3000);
          this.msjValidation = 'Crea tu primera publicación.'
          this.validation = true; return ;
        }

        
        this.listPost = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
      },
      error: (err:any) => {
        this.loading = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }
}
