import { Component } from '@angular/core';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/Post/post.service';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';


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

  constructor(private postsService: PostService) {}

  getObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  generateImageFormatPreview(): string {
    let preview = 'images[]: [\n';
    this.uploadedFiles.forEach(file => {
      preview += `  "${file.name}",\n`;
    });
    preview += ']';
    return preview;
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
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
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