import { Component } from '@angular/core';
import { Editor, EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PostService } from '../../../core/services/Post/post.service';

@Component({
  selector: 'public-add-post',
  standalone: true,
  imports: [EditorModule, FileUploadModule, ButtonModule, CommonModule, FormsModule],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.scss'
})
export class AddPostComponent {
  htmlContent: string = '';
  title: string = '';
  uploadedFiles: File[] = [];
  isLoading: boolean = false;

  constructor(private postsService: PostService) {}

  // Método para generar URLs de objeto para vista previa
  getObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Método para liberar las URLs cuando ya no se necesiten
  ngOnDestroy() {
    this.uploadedFiles.forEach(file => {
      URL.revokeObjectURL(this.getObjectUrl(file));
    });
  }

  onFileSelect(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  removeFile(index: number) {
    // Liberar la URL de objeto antes de eliminar el archivo
    URL.revokeObjectURL(this.getObjectUrl(this.uploadedFiles[index]));
    this.uploadedFiles.splice(index, 1);
  }

  submitPost() {
    this.isLoading = true;
    
    if (!this.title && this.htmlContent) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.htmlContent;
      const firstParagraph = tempDiv.querySelector('p, h1, h2, h3, h4, h5, h6');
      this.title = firstParagraph?.textContent?.substring(0, 100) || 'Sin título';
    }

    const postData = {
      title: this.title,
      description: this.htmlContent,
      images: this.uploadedFiles
    };

    this.postsService.addPost(postData).subscribe({
      next: (response) => {
        console.log('Post creado exitosamente:', response);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al crear el post:', error);
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    // Liberar todas las URLs de objeto
    this.uploadedFiles.forEach(file => {
      URL.revokeObjectURL(this.getObjectUrl(file));
    });
    
    this.htmlContent = '';
    this.title = '';
    this.uploadedFiles = [];
    this.isLoading = false;
  }
}