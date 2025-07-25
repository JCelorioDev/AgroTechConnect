import { Component, inject } from '@angular/core';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/Post/post.service';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { AlertService } from '../../../shared/alerts/alert.service';
import { Accordion } from 'primeng/accordion';

@Component({
  selector: 'public-add-post',
  standalone: true,
  imports: [
    EditorModule, 
    FileUploadModule, 
    ButtonModule, 
    CommonModule, 
    FormsModule, 
    InputTextModule,
    AccordionModule
  ],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.scss'
})
export class AddPostComponent {
  htmlContent: string = '';
  title: string = '';
  uploadedFiles: File[] = [];
  isLoading: boolean = false;
  private readonly alertService = inject(AlertService);

  constructor(public postsService: PostService) {}

  getObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  onFileSelect(event: any) {
    const files: File[] = event.files;
    if (files && files.length > 0) {
      this.uploadedFiles = [...this.uploadedFiles, ...files];
    }
  }

  removeFile(index: number) {
    URL.revokeObjectURL(this.getObjectUrl(this.uploadedFiles[index]));
    this.uploadedFiles.splice(index, 1);
  }

  submitPost() {
    this.isLoading = true;
    
    // Limpiar el contenido HTML
    let cleanContent = this.htmlContent;
    if (cleanContent) {
      cleanContent = this.cleanHtmlContent(cleanContent);
    }

    if (!this.title && cleanContent) {
      this.title = cleanContent.substring(0, 100) || 'Sin título';
    }
  
    const postData = {
      title: this.title,
      description: cleanContent,
      images: this.uploadedFiles
    };

    if (!postData.title || !postData.description) {
      this.isLoading = false;
      this.alertService.miniAlert('Campos vacíos o inválidos.', 'info', 2500); return ;
    }
  
    this.postsService.addPost(postData).subscribe({
      next: (response) => {
        this.resetForm();
        this.alertService.miniAlert('La publicación se creó correctamente', 'success', 3000);
        this.closeAccordion();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 422) {
          this.alertService.showValidationErrors(error.error);
        } else {
          this.alertService.miniAlert(error.error.message, 'error', 3000);
        }
      }
    });
  }

  private cleanHtmlContent(html: string): string {
    // 1. Eliminar todos los <span> (no aportan formato)
    let cleaned = html.replace(/<\/?span[^>]*>/g, '');
  
    // 2. Eliminar <p> si no contienen formato (opcional)
    cleaned = cleaned.replace(/<p[^>]*>(.*?)<\/p>/g, '$1');
  
    // 3. Eliminar atributos innecesarios (como class, style, etc.)
    cleaned = cleaned.replace(/<(\w+)[^>]*>/g, '<$1>');
  
    // 4. Eliminar &nbsp; y espacios extras
    cleaned = cleaned.replace(/&nbsp;/g, ' ').trim();
  
    return cleaned;
  }
  
  private closeAccordion() {
    const accordion = document.querySelector('.post-creator-accordion');
    if (accordion) {
      const tab = accordion.querySelector('.p-accordion-tab');
      if (tab) {
        tab.classList.remove('p-accordion-tab-active');
        const content = tab.querySelector('.p-accordion-content') as HTMLElement;
        if (content) {
          content.style.display = 'none';
        }
      }
    }
  }

  private resetForm() {
    this.uploadedFiles.forEach(file => {
      URL.revokeObjectURL(this.getObjectUrl(file));
    });
    
    this.htmlContent = '';
    this.title = '';
    this.uploadedFiles = [];
    this.isLoading = false;
  }


}