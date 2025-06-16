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
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { passwordMatchValidator } from '../../../core/validation/password repeat/passwordMatchValidator';
import { TextareaModule } from 'primeng/textarea';
import { UserInformation } from '../../../core/models/User/showInformationOpcResponse.interface';
import { EmojiService } from '../../../shared/services/api-emoji/emoji.service';
import { DividerModule } from 'primeng/divider';

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
    SkeletonModule,
    Dialog,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    PasswordModule,
    TextareaModule, 
    DividerModule
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
  public formChangePassword!:FormGroup;
  private formBuilder = inject(FormBuilder);
  public visibleChangePassword:boolean = false; 
  hoverAvatar = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedImage: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  public loading_spinning:boolean = false;
  public loading_spinning2:boolean = false;
  currentPhotoUrl: string | null = null;
  public visibleModal:boolean= false;
  public visibleModalUpdateInformation:boolean = false;
  public formUpdateinformationAdictional!:FormGroup;
  private objUserInformation!:UserInformation;
  activeLinks: number = 1; 
  private updateConfirm:boolean = false;
  @ViewChild('descriptionInput') descriptionInput!: ElementRef<HTMLTextAreaElement>;
  showDialog = false;
  private readonly emojiService = inject(EmojiService);
  public listFollowersMe!:any[];
  public listFollowingsMe!:any[];
  public dialogoFollowers:boolean = false;

  emojis: string[] = [];


  encryptedId = toSignal(
    this.route.params.pipe(
      map(params => params['id'])
    )
  );

  constructor(){

    this.formChangePassword = this.formBuilder.group({
      password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,15}$/)]),
      new_password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,15}$/)]),
      new_password_confirmation : new FormControl('', Validators.required)
    }, {
        validators: passwordMatchValidator('new_password', 'new_password_confirmation')
    });

    this.formUpdateinformationAdictional = this.formBuilder.group({
      description: ['', [Validators.required, Validators.maxLength(500)]],
      link1: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],
      link2: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],
      link3: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]]
    });

    this.userService.currentUserPhoto$.subscribe(newUrl => {
      this.currentPhotoUrl = newUrl;
      
      // Actualiza tanto el currentPhotoUrl como el objUser.image.url
      if (this.objUser?.image) {
        if (newUrl === '') {
          // Foto eliminada - establece null para usar la imagen por defecto
          this.objUser.image.url = null;
          this.currentPhotoUrl = null;
        } else if (newUrl) {
          // Nueva foto - actualiza ambos
          this.objUser.image.url = newUrl;
          this.currentPhotoUrl = newUrl;
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.encryptedId()) { 
      this.getInformationnByID();
    } else {
      this.getAllEmojis();
      this.getInformation();
    }
  }

  getInformation(): void {
    this.userService.getInformation().subscribe({
      next: (s) => {
        this.objUser = s.data;
        // Sincroniza el currentPhotoUrl con la foto del backend
        if (this.objUser?.image?.url) {
          this.currentPhotoUrl = this.objUser.image.url;
        } else {
          this.currentPhotoUrl = null;
        }
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
              this.getInformation();
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
            if (!this.objUser.image) {
              this.alertService.miniAlert('No tienes un avatar por eliminar, sube uno.', 'error', 3000);
            }
            this.loading_spinning = false;
            this.alertService.miniAlert('Tu foto de perfil se eliminó correctamente.', 'success', 3000);
            this.getInformation();
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


  // Métodos para verificar cada requisito de contraseña
  get password() {
    return this.formChangePassword.get('password') as FormControl;
  }

  get lengthValid() {
    const value = this.password.value || '';
    return value.length >= 8 && value.length <= 15;
  }

  get hasUpperCase() {
    return /[A-Z]/.test(this.password.value || '');
  }

  get hasNumber() {
    return /[0-9]/.test(this.password.value || '');
  }

  get hasSpecialChar() {
    return /[@$!%*?&]/.test(this.password.value || '');
  }


  get password2() {
    return this.formChangePassword.get('new_password') as FormControl;
  }

  get lengthValid2() {
    const value = this.password2.value || '';
    return value.length >= 8 && value.length <= 15;
  }

  get hasUpperCase2() {
    return /[A-Z]/.test(this.password2.value || '');
  }

  get hasNumber2() {
    return /[0-9]/.test(this.password2.value || '');
  }

  get hasSpecialChar2() {
    return /[@$!%*?&]/.test(this.password2.value || '');
  }


  // Actualizar la contraseña de usuario

  updatePassword():void{
    if (this.formChangePassword.invalid) {
      this.alertService.miniAlert('Campos vacíos o inválidos.', 'info', 2500);
      this.formChangePassword.markAllAsTouched(); return ;
    }
    
    this.loading_spinning = true;

    this.userService.updatePassword(this.formChangePassword.value).subscribe({
      next: (s) => {
        this.alertService.miniAlert('Tu contraseña se cambió correctamente, vuelve a iniciar sesión.', 'success', 3000);
        localStorage.clear();
        this.router.navigate(['menu/publicaciones']);
        this.loading_spinning = false;
      },
      error: (err) => {
        this.loading_spinning = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        }else{
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    })
  }

  updateInformationOpc():void{
    if (this.formUpdateinformationAdictional.invalid) {
      this.alertService.miniAlert('Campos vacíos o inválidos.', 'info', 2500);
      this.formUpdateinformationAdictional.markAllAsTouched(); return ;
    }

    this.loading_spinning2 = true;

    this.userService.updateInformation(this.formUpdateinformationAdictional.value).subscribe({
      next: (s) => {
        this.updateConfirm = true;
        this.showInformationOpc();
        this.getInformation();
        this.alertService.miniAlert('La información adicional se actualizó correctamente', 'success', 3000);
        this.visibleModalUpdateInformation = false;
        this.loading_spinning2 = false;
      },
      error: (err) => {
        this.visibleModalUpdateInformation = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    })
  }

  // Mostrar información adicional de usuario

  showInformationOpc(): void {    
    this.loading_spinning2 = true;

    this.userService.showInformationOpc().subscribe({
      next: (s) => {
        this.objUserInformation = s.data.user_information;
        
        // Actualizar el formulario con los datos del usuario
        this.formUpdateinformationAdictional.patchValue({
          description: this.objUserInformation?.description,
          link1: this.objUserInformation?.link1,
          link2: this.objUserInformation?.link2,
          link3: this.objUserInformation?.link3
        });

        // Calcular cuántos links están activos
        this.calculateActiveLinks();


        this.loading_spinning2 = false;

        if (!this.updateConfirm) {
          this.visibleModalUpdateInformation = true; 
        }

        this.updateConfirm = false;
      },
      error: (err) => {
        this.loading_spinning2 = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }

  calculateActiveLinks(): void {
    this.activeLinks = 0;
    if (this.formUpdateinformationAdictional.get('link1')?.value) this.activeLinks = 1;
    if (this.formUpdateinformationAdictional.get('link2')?.value) this.activeLinks = 2;
    if (this.formUpdateinformationAdictional.get('link3')?.value) this.activeLinks = 3;
    
    // Si todos los links están vacíos, mostramos al menos uno
    if (this.activeLinks === 0) this.activeLinks = 1;
  }

  showLinkField(linkNumber: number): boolean {
    return linkNumber <= this.activeLinks;
  }


  // Método para verificar si se pueden añadir más links
  canAddMoreLinks(): boolean {
    const totalLinks = [
      this.formUpdateinformationAdictional.get('link1')?.value,
      this.formUpdateinformationAdictional.get('link2')?.value,
      this.formUpdateinformationAdictional.get('link3')?.value
    ].filter(link => link !== null && link !== '').length;
    
    return totalLinks < 3 && this.activeLinks < 3;
  }

  // Método para añadir nuevo link
  addNewLink(): void {
    if (this.canAddMoreLinks()) {
      this.activeLinks++;
    }
  }

  // Método para eliminar link
  removeLink(linkNumber: number): void {
    // Resetear el valor del link a null
    this.formUpdateinformationAdictional.get(`link${linkNumber}`)?.setValue(null);
    
    // Si estamos eliminando el último link visible, reducimos el contador
    if (linkNumber === this.activeLinks) {
      this.activeLinks--;
    } else {
      // Si eliminamos un link intermedio, reorganizamos
      this.reorganizeLinks();
    }
  }

  // Método privado para reorganizar links
  private reorganizeLinks(): void {
    const links = [
      this.formUpdateinformationAdictional.get('link1')?.value,
      this.formUpdateinformationAdictional.get('link2')?.value,
      this.formUpdateinformationAdictional.get('link3')?.value
    ].filter(link => link !== null && link !== '');

    // Resetear todos los links
    this.formUpdateinformationAdictional.get('link1')?.setValue(null);
    this.formUpdateinformationAdictional.get('link2')?.setValue(null);
    this.formUpdateinformationAdictional.get('link3')?.setValue(null);

    // Asignar los links sin huecos
    links.forEach((link, index) => {
      this.formUpdateinformationAdictional.get(`link${index + 1}`)?.setValue(link);
    });

    this.activeLinks = links.length > 0 ? links.length : 1;
  }

  addEmoji(emoji: string) {
    const textarea = this.descriptionInput.nativeElement;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentValue = this.formUpdateinformationAdictional.get('description')?.value || '';

    // Insertar el emoji en la posición actual del cursor
    const newValue = currentValue.substring(0, startPos) + emoji + currentValue.substring(endPos);
    
    // Actualizar el formControl
    this.formUpdateinformationAdictional.get('description')?.setValue(newValue);
    
    // Cerrar el diálogo
    this.showDialog = false;
    

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
    }, 0);
  }

  // Obtener lista de emojis

  getAllEmojis(): void {
    this.emojiService.getsAllEmojis().subscribe({
      next: (response) => {
        const emojis = response.map(e => e.emoji);
        this.emojis = Array.from(new Set(emojis)).sort(); 
      },
      error: (err) => {
        console.error('Error al cargar los emojis', err);
      }
    });
  }

  // Seguir a un usuario

  followAuser():void{
    this.loading_spinning2 = true;
    this.userService.followAuser(this.encryptedId()).subscribe({
      next: (s) => {
        this.alertService.miniAlert('Comenzaste a seguir este usuario correctamente.', 'success', 3000);
        this.loading_spinning2 = false;
      },
      error: (err) => {
        this.loading_spinning2 = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    })
  }

  // Método para saber si ya el usuario sigue a un usuario

  verifyFollowUser(): boolean {
    if (!this.objUser?.followers || !Array.isArray(this.objUser.followers)) {
      return false;
    }
  
    for (const follow of this.objUser.followings) {
      if (follow.id === this.encryptedId()) {
        return true; 
      }
    }
    
    return false; 
  }

  mefollowers():void{
    this.loading_spinning2 = true;

    this.meFollowing();
    this.userService.mefollowers().subscribe({
      next: (s) => {
       this.listFollowersMe = s.data.data;
       this.loading_spinning2 = false;
       this.dialogoFollowers = true;
      },
      error: (err) => {
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    })

  }

  // Ver mis seguidos

  meFollowing():void{
    this.userService.meFollowing().subscribe({
      next: (s) => {
       this.listFollowingsMe = s.data.data;
      },
      error: (err) => {
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    })
  }

  // Verificar si ya el response de seguidor y seguidores esta listo

  verifyFollowersAndFollowings():void{
    if (this.listFollowersMe.length > 0 && this.listFollowingsMe.length > 0) {
      this.loading_spinning2 = false;
      this.dialogoFollowers = true;
    }
  }

  // Ver seguidores de otro usuario

  followers():void{
    
  }


}