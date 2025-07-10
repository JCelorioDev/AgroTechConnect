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

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    AvatarModule,
    DividerModule,
    ProgressSpinnerModule,
    PaginatorModule
  ],
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);

  listPost: Datum[] = [];
  loading = true;
  error: string | null = null;
  totalRecords = 0;
  currentPage = 1;

  ngOnInit(): void {
    this.getsPost();
  }

  getsPost(): void {
    this.loading = true;
    this.error = null;

    this.postService.getsPost(this.currentPage).subscribe({
      next: (response) => {
        this.listPost = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las publicaciones';
        this.alertService.miniAlert(err.error.message || 'Error desconocido', 'error', 3000);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.getsPost();
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
}