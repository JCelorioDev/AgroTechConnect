import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { UserService } from '../../../core/services/User/user.service';
import { Data } from '../../../core/models/User/userResponse.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertService } from '../../../shared/alerts/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    PanelModule,
    TagModule,
    SkeletonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private readonly userService = inject(UserService);
  public objUser!: Data;
  public range: any = null;
  public isLoadingInfoUser: boolean = true;
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  hoverAvatar = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedImage: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  public loading_spinning:boolean = false;
  currentPhotoUrl: string | null = null;

  encryptedId = toSignal(
    this.route.params.pipe(
      map(params => params['id'])
    )
  );

  constructor(){

    this.userService.currentUserPhoto$.subscribe(newUrl => {
      this.currentPhotoUrl = newUrl; 
      if (this.objUser?.image) {

        this.objUser.image.url = newUrl !== null ? newUrl : this.objUser.image.url;
      }
    });
  }

  ngOnInit(): void {
    if (this.encryptedId()) { 
      this.getInformationnByID();
    } else {
      this.getInformation();
    }
  }

  getInformation(): void {
    this.userService.getInformation().subscribe({
      next: (s) => {
        this.objUser = s.data;
        this.processRanges();
        this.isLoadingInfoUser = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  getInformationnByID(): void {
    this.userService.getInformationnByID(this.encryptedId()!).subscribe({
      next: (s) => {
        this.objUser = s.data;
        this.processRanges();
        this.isLoadingInfoUser = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  private processRanges(): void {
    if (this.objUser?.ranges?.length > 0) {
      this.range = this.objUser.ranges.reduce((prev, current) => 
        (current.max_range > prev.max_range) ? current : prev, 
        this.objUser.ranges[0] // Valor inicial seguro
      );
    }
  }

  private handleError(err: any): void {
    this.router.navigate(['menu/publicaciones']);
    this.alertService.miniAlert(err.error.message, 'error', 2500);
    localStorage.clear();
    this.isLoadingInfoUser = false;
  }

  hasSocialLinks(): boolean {
    if (!this.objUser?.user_information) return false;
    const links = [
      this.objUser.user_information.link1,
      this.objUser.user_information.link2,
      this.objUser.user_information.link3
    ];
    return links.some(link => link && typeof link === 'string' && link.trim() !== '');
  }

  getSocialLinks(): string[] {
    if (!this.objUser?.user_information) return [];
    return [
      this.objUser.user_information.link1,
      this.objUser.user_information.link2,
      this.objUser.user_information.link3
    ].filter(link => link && typeof link === 'string' && link.trim() !== '');
  }

  getSocialIcon(url: string): { icon: string } {
    const lower = url.toLowerCase();
    if (lower.includes('linkedin.com')) return { icon: 'pi pi-linkedin' };
    if (lower.includes('youtube.com')) return { icon: 'pi pi-youtube' };
    if (lower.includes('facebook.com')) return { icon: 'pi pi-facebook' };
    if (lower.includes('twitter.com') || lower.includes('x.com')) return { icon: 'pi pi-twitter' };
    if (lower.includes('instagram.com')) return { icon: 'pi pi-instagram' };
    return { icon: 'pi pi-link' };
  }


  getRangeImageUrl(rangeName: string | undefined): string {
    if (!rangeName) return 'img/trofeos/novato.png'; 
    
    const rangeImages: {[key: string]: string} = {
      'aprendiz': 'img/trofeos/aprendiz.png',
      'contribuyente': 'img/trofeos/contribuyente.png',
      'experto': 'img/trofeos/experto.png',
      'iniciado': 'img/trofeos/iniciado.png',
      'leyenda': 'img/trofeos/leyenda.png',
      'novato': 'img/trofeos/novato.png'
    };
  

    const normalizedRange = rangeName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    return rangeImages[normalizedRange] || rangeImages['novato'];
  }





  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (!input.files?.length) return;
  
    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeMB = 3;
  
    // Validaciones...
  
    this.selectedImage = file;
  
    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
  
      this.alertService.alertwithDialogs(
        '¿Estás seguro de cambiar la foto de tu perfil?',
        'Después no podrás revertir esta acción',
        'warning',
        3000,
        () => {
          if (!this.selectedImage) return;

          this.loading_spinning = true;
  
          const formData = new FormData();
          formData.append('avatar', this.selectedImage);

          this.userService.uploadPhotoUser(formData).subscribe({
            next: (s) => {
              this.loading_spinning = false;
              this.alertService.miniAlert('Tu foto de perfil se actualizó correctamente.', 'success', 3000);
              this.resetFileInput();
            },
            error: (err) => {
              this.loading_spinning = false;
              if (err.status === 422) {
                this.alertService.showValidationErrors(err.error);
              } else {
                this.alertService.miniAlert(err.error.message, 'error', 3000);
              }
            }
          });
        },
        'No, deseo!',
        'Sí, deseo',
        `<img src="${previewUrl}" alt="Vista previa" style="margin-top: 1rem; width: 150px; height: 150px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 10px rgba(0,0,0,0.2);" />`
      );
    };
  
    reader.readAsDataURL(file);
  }
  




  deletePhoto() {
    this.alertService.alertwithDialogs(
      '¿Estás seguro de eliminar tu foto de tu perfil?',
      'Después no podrás revertir esta acción',
      'warning',
      3000,
      () => {
        this.loading_spinning = true;

        this.userService.deletePhoto().subscribe({
          next: (s) => {
            this.loading_spinning = false;
            this.alertService.miniAlert('Tu foto de perfil se eliminó correctamente.', 'success', 3000);
            // No es necesario actualizar manualmente aquí, el BehaviorSubject se encargará
          },
          error: (err) => {
            this.loading_spinning = false;
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            } else {
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        });
      },
      'No, deseo!',
      'Sí, deseo'
    );
  }



  resetFileInput(): void {
    this.fileInput.nativeElement.value = '';
    this.selectedImage = null;
    this.previewUrl = null;
  }



}