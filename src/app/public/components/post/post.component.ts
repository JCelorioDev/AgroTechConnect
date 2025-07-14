import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil, combineLatest } from 'rxjs';

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
    PaginatorModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent implements OnInit, OnDestroy {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public validation:boolean = false;
  public msjValidation:string = '';
  
  listPost: Datum[] = [];
  loading = true;
  totalRecords = 0;
  currentPage = 1;
  private currentRoute!:string;
  private segments!:string[];
  searchQuery: string = '';
  yearFilter: number | null = null;
  monthFilter: number | null = null;

  private destroy$ = new Subject<void>();

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  verifyRoute(): void {
    const baseRoute = this.router.url.split('?')[0];
    this.segments = baseRoute.split('/');

    if(this.segments[2] === 'publicaciones'){
      this.getPosts();
    } else {
      const userLogin = localStorage.getItem('userLogin');
      const hisToken = userLogin ? !!JSON.parse(userLogin)?.token : false;
      
      if(!hisToken){
        this.validation = true;
        this.loading = false;
        this.msjValidation = 'Ingresa una cuenta primero para realizar una publicación.';
        this.alertService.miniAlert('Ingresa una cuenta primero', 'warning', 3000);
        return;
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

  getPosts(): void {
    this.loading = true;
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

  getsMePost(): void {
    this.loading = true;
    this.postService.getsMePost(
      this.currentPage, 
      10, 
      this.searchQuery,
      this.yearFilter,
      this.monthFilter
    ).subscribe({
      next: (response) => {
        if(response.data.data.length === 0){
          this.alertService.miniAlert('No tienes publicaciones aún', 'warning', 3000);
          this.msjValidation = 'Crea tu primera publicación.'
          this.validation = true; 
          this.loading = false;
          return;
        }
        
        this.listPost = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
        this.validation = false;
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