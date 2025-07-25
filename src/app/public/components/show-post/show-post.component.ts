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
    GalleriaModule
  ],
  templateUrl: './show-post.component.html',
  styleUrls: ['./show-post.component.scss']
})
export class ShowPostComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  private readonly alertService = inject(AlertService);
  private readonly domSanitizer = inject(DomSanitizer );

  private idPublicacion!: string;
  public objPublication!: Data;
  public loading = true;
  public displayCommentsDialog = false;
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
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    this.loadPublication();
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
}