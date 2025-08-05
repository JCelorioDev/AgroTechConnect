import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../core/services/Post/post.service';
import { Datum } from '../../../core/models/Post/postRespone.interface';
import { AlertService } from '../../../shared/alerts/alert.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-preguntas',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    PaginatorModule,
    SkeletonModule,
    TagModule,
    AvatarModule,
    TooltipModule,
    DividerModule,
    RouterModule,
    DatePipe
  ],
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.scss']
})
export class PreguntasComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);

  public unansweredPosts: Datum[] = []; // Solo posts sin respuestas
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalUnansweredPosts = 0; // Total de posts sin respuestas
  public loading = false;
  public first = 0;
  private readonly router = inject(Router);

  private searchQuery: string = '';
  private yearFilter: number | null = null;
  private monthFilter: number | null = null;

  ngOnInit(): void {
    this.getUnansweredPosts();
  }

  getUnansweredPosts(): void {
    this.loading = true;
    this.unansweredPosts = [];

    this.postService.getsPost(
      this.currentPage,
      this.itemsPerPage,
      this.searchQuery,
      this.yearFilter,
      this.monthFilter
    ).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response?.data?.data) {
          // Filtrar solo posts sin respuestas

          response.data.data.forEach((data: Datum) => {
            if(data.comments_count <= 0){
              this.unansweredPosts.push(data);
            }
          });
          
          this.totalUnansweredPosts = this.unansweredPosts.length;

          // Si hay filtros aplicados y no hay resultados
          if (this.hasFilters() && this.unansweredPosts.length === 0) {
            this.showNoResultsAlert();
          }
        } else {
          this.handleInvalidResponse();
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.itemsPerPage = event.rows || 10;
    this.currentPage = (event.page || 0) + 1;
    this.getUnansweredPosts();
  }

  private hasFilters(): boolean {
    return !!this.searchQuery || this.yearFilter !== null || this.monthFilter !== null;
  }

  private showNoResultsAlert(): void {
    this.alertService.miniAlert(
      'No se encontraron publicaciones sin resolver con los filtros aplicados', 
      'info', 
      2000
    );
  }

  private handleInvalidResponse(): void {
    this.alertService.miniAlert(
      'La estructura de la respuesta no es la esperada',
      'warning',
      2000
    );
  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(
        err.error?.message || 'Error al cargar las publicaciones',
        'error',
        3000
      );
    }
  }

  getInitials(user: any): string {
    if (!user) return '';

    // Obtener la primera letra del nombre
    const firstNameInitial = user.name ? user.name.charAt(0).toUpperCase() : '';

    // Obtener la primera letra del apellido (si existe)
    const lastNameInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : '';

    return `${firstNameInitial}${lastNameInitial}`;
  }

  // Ir a ver la publicacion

  showPostByID(idPublicacion:string):void{
    this.router.navigate(['menu/mostrar-publicacion', idPublicacion]);
  }
}