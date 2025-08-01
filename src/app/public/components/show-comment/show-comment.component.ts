import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentsService } from '../../../core/services/Comments/comments.service';
import { ViewCommentResponse } from '../../../core/models/Comments/viewCommentResponse.interface';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { AlertService } from '../../../shared/alerts/alert.service';
import { User } from '../../../core/models/Comments/createCommentInPost.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditCommentInPostI } from '../../../core/models/Comments/editCommentInPost.interface';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';


@Component({
  selector: 'public-show-comment',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    TagModule,
    DividerModule,
    CardModule,
    ProgressSpinnerModule,
    GalleriaModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    FileUploadModule
  ],
  templateUrl: './show-comment.component.html',
  styleUrl: './show-comment.component.scss'
})
export class ShowCommentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly commentsService = inject(CommentsService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  public idComentario!: string;
  public idPublicacion!: string;
  public commentData: ViewCommentResponse | null = null;
  public loading = true;
  public activeImageIndex = 0;
  public objUser!:User;
  public editDialogVisible = false;
  public editForm!: FormGroup;
  public uploadedFiles: any[] = [];
  public isEditing = false;
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private segments!: string[];


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

  public rolUser !:string;

  constructor(){
    this.objUser = JSON.parse(localStorage.getItem('userLogin')!);
    this.rolUser = JSON.parse(localStorage.getItem('userLogin')!)?.roles[0]?.name;
    console.log(this.rolUser);
    this.initEditForm();
  }

  private initEditForm(): void {
    this.editForm = this.fb.group({
      comment: [''],
      images: [null]
    });
  }


  ngOnInit(): void {
    this.idComentario = this.route.snapshot.paramMap.get('idPublicacion')!;
    this.idPublicacion = this.route.snapshot.paramMap.get('idComentario')!;
    this.loadComment();
  }

  loadComment(): void {
    this.loading = true;
    if (this.commentsService.getOpc === 'replayComment') {
      this.commentsService.viewResponseOfComment(this.idComentario).subscribe({
        next: (response) => {
          this.commentData = response;
          console.log(this.commentData);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    }else{
      this.commentsService.viewComment(this.idComentario).subscribe({
        next: (response) => {
          this.commentData = response;
          console.log(this.commentData);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    }

  }

  private handleError(err: any): void {
    if (err.status === 422) {
      this.alertService.showValidationErrors(err.error);
    } else {
      this.alertService.miniAlert(err.error?.message || 'Error al cargar el comentario', 'error', 3000);
    }
  }

  getRangeSeverity(rangeName: string | undefined): any {
    if (!rangeName) return 'info';

    switch(rangeName.toLowerCase()) {
      case 'novato': return 'info';
      case 'aprendiz': return 'success';
      case 'iniciado': return 'warning';
      case 'experto': return 'danger';
      default: return 'info';
    }
  }

  getAvatarLabel(user: any): string {
    if (user.image?.url) return '';
    return (user.name.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }

  // Editar comentario
  showEditDialog(): void {
    this.editForm.patchValue({
      comment: this.commentData?.data?.comment
    });
    this.editDialogVisible = true;
  }

  onUpload(event: any): void {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  editComment(): void {
    if (this.editForm.invalid) return;

    this.isEditing = true;
    const formData = new FormData();
    formData.append('comment', this.editForm.get('comment')?.value);

    // Agregar archivos si existen
    if (this.uploadedFiles.length > 0) {
      for (let file of this.uploadedFiles) {
        formData.append('images[]', file);
      }
    }

    this.commentsService.editCommentInPost(this.idPublicacion, this.idComentario, formData).subscribe({
      next: (response: any) => {
        this.alertService.miniAlert('Comentario actualizado correctamente', 'success', 2000);
        this.commentData!.data = response.data; // Actualizar los datos del comentario
        this.editDialogVisible = false;
        this.uploadedFiles = [];
        this.isEditing = false;
      },
      error: (err) => {
        this.isEditing = false;
        this.handleError(err);
      }
    });
  }

  // Borrar un comentario (Admin)


  deleteComment():void{

    const baseRoute = this.router.url.split('?')[0];
    this.segments = baseRoute.split('/');

    this.alertService.alertwithDialogs('Estás seguro que deseas eliminar este comentario?', 'Después no podrás revertir esta acción', 'warning', 3000, (() => {
      if (this.commentsService.getOpc === 'replayComment') {
        this.commentsService.deleteReplayComment(this.idComentario).subscribe({
          next: (s) => {
            this.alertService.miniAlert('El comentario se eliminó correctamente', 'success', 3000);
            this.location.back();
          },
          error: (err) => {
            this.handleError(err);
          }
        })
      }else{
        this.commentsService.deleteComment(this.idComentario).subscribe({
          next: (s) => {
            this.alertService.miniAlert('El comentario se eliminó correctamente', 'success', 3000);
            this.location.back();
          },
          error: (err) => {
            this.handleError(err);
          }
        })
      }
    }))
  }

}