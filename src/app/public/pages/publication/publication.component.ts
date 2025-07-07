import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PostService } from '../../../core/services/Post/post.service';
import { Datum, PostInterfaceI } from '../../../core/models/Post/postRespone.interface';
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
    ProgressSpinnerModule
  ],
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);

  listPost: Datum[] = [];
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.getsPost();
  }

  getsPost(): void {
    this.loading = true;
    this.error = null;

    this.postService.getsPost().subscribe({
      next: (response) => {
        this.listPost = response.data.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las publicaciones';
        
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message || 'Error desconocido', 'error', 3000);
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
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