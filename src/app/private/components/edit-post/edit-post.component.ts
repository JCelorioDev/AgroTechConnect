import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Services
import { PostService } from '../../../core/services/Post/post.service';
import { AlertService } from '../../../shared/alerts/alert.service';

// Interfaces
import { Data } from '../../../core/models/Post/showPostResponse.interface';
import { AddedPostRequestI } from '../../../core/models/Post/addedPostRequest.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    FileUploadModule,
    ButtonModule,
    ProgressSpinnerModule,
    RippleModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EditPostComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private idPublicacion!: string;
  public post!: Data;
  private readonly alertService = inject(AlertService);
  public loading: boolean = false;
  public deleting: boolean = false;
  private readonly fb = inject(FormBuilder);
  public editForm!: FormGroup;
  public uploadedFiles: File[] = [];
  public imagesToDelete: string[] = [];
  private readonly domSanitizer = inject(DomSanitizer );

  ngOnInit(): void {
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.showPost();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      images: [[]]
    });
  }

  showPost(): void {
    this.loading = true;
    this.postService.showPost(this.idPublicacion).subscribe({
      next: (response) => {
        this.post = response.data;
        this.editForm.patchValue({
          title: this.post.title,
          description: this.htmlToFormattedText(this.post.description) 
        });
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

  onImageSelect(event: { files: File[] }): void {
    this.uploadedFiles = [...this.uploadedFiles, ...event.files];
    this.editForm.patchValue({
      images: this.uploadedFiles
    });
  }

  onImageRemove(event: { file: File }): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== event.file.name);
    this.editForm.patchValue({
      images: this.uploadedFiles
    });
  }

  removeExistingImage(imageId: string): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta imagen?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        this.postService.deleteOnePhoto(this.idPublicacion, imageId).subscribe({
          next: () => {
            this.post.images = this.post.images.filter(img => img.id !== imageId);
            this.alertService.miniAlert('Imagen eliminada correctamente', 'success', 3000);
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            this.alertService.miniAlert(err.error.message, 'error', 3000);
          }
        });
      }
    });
  }

  deleteAllImages(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar todas las imágenes de esta publicación?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar todas',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleting = true;
        this.postService.deleteAllPhotos(this.idPublicacion).subscribe({
          next: () => {
            this.post.images = [];
            this.alertService.miniAlert('Todas las imágenes fueron eliminadas', 'success', 3000);
            this.deleting = false;
          },
          error: (err) => {
            this.deleting = false;
            this.alertService.miniAlert(err.error.message, 'error', 3000);
          }
        });
      }
    });
  }

  getDescriptionValue(): string {
    const description = this.editForm.get('description')?.value;
    if (!description) return '';
    
    // Convertir HTML a texto plano manteniendo saltos de línea
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  updatePost(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const postData: AddedPostRequestI = {
      title: this.editForm.get('title')?.value,
      description: this.editForm.get('description')?.value,
      images: this.uploadedFiles
    };

    this.postService.updatePost(postData, this.idPublicacion).subscribe({
      next: () => {
        this.loading = false;
        this.alertService.miniAlert('Publicación actualizada correctamente', 'success', 3000);
        this.router.navigate(['menu/mis-publicaciones']);
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

  htmlToFormattedText(html: string): string {
    if (!html) return '';
  
    // Convertir listas a texto con viñetas
    let text = html
      .replace(/<ul>/g, '')                     // Eliminar <ul>
      .replace(/<\/ul>/g, '\n')                 // Convertir </ul> a salto de línea
      .replace(/<li>/g, '• ')                   // Convertir <li> a viñeta
      .replace(/<\/li>/g, '\n')                 // Convertir </li> a salto de línea
      .replace(/<a\b[^>]*>(.*?)<\/a>/g, '$1');  // Eliminar <a> pero mantener texto
  
    // Eliminar todas las demás etiquetas HTML
    text = text.replace(/<\/?[^>]+(>|$)/g, '');
  
    // Reemplazar múltiples espacios o saltos de línea
    text = text.replace(/\s+/g, ' ').trim();
  
    return text;
  }
}