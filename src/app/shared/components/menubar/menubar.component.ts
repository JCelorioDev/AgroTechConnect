import { Notification } from './../../../core/models/Notifications/notificationsResponse.interface';
import { Component, ElementRef, inject, ViewChild} from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '../../../auth/pages/login/login.component';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { RegisterComponent } from '../../../auth/pages/register/register.component';
import Swal from 'sweetalert2';
import { AlertService } from '../../alerts/alert.service';
import { passwordMatchValidator } from '../../../core/validation/password repeat/passwordMatchValidator';
import { PasswordModule } from 'primeng/password';
import { InputOtp } from 'primeng/inputotp';
import { UserService } from '../../../core/services/User/user.service';
import { RolsService } from '../../../core/utils/Roles/rols.service';
import { parse } from 'path';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { NotificationsService } from '../../../core/services/Notifications/notifications.service';
import { PostService } from '../../../core/services/Post/post.service';
import { FiltersSearchComponent } from "../filter-search/filters-search/filters-search.component";



@Component({
  selector: 'shared-menubar',
  imports: [InputTextModule, ButtonModule, TooltipModule, CommonModule, FormsModule, Dialog, LoginComponent, RegisterComponent, ReactiveFormsModule, PasswordModule, InputOtp, FiltersSearchComponent],
  standalone: true,
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss'
})
export class MenubarComponent {
  public searchQuery: string = '';
  private destroy$ = new Subject<void>();

  public visible: boolean = false;
  private readonly router = inject(Router);
  public isVisibleLogin:boolean = false;
  public isVisibleRegister:boolean = false;
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);
  public isLoadingLogout:boolean = false;
  private previousState: string | null = null;
  private isLoggingOut = false; // ← Bandera para evitar falsos positivos
  public readonly rolService = inject(RolsService);
  public activeDialogEliminate:boolean = false; // Variable para activar el dialogo de confirmacion  de eliminar cuenta
  public activeDialogEliminate2:boolean = false;
  public formEliminateAccount!:FormGroup;
  public valueCodePasswordConfirmation:string = '';;
  public generatedCode: string = '';
  screenWidth: number;
  private readonly postService = inject(PostService);

  public notifications: Notification[] = [];
  public unreadCount: number = 0;
  public showNotificationsDropdown: boolean = false;
  public isLoadingNotifications: boolean = false;
  public currentPage: any = 1;
  public totalPages: number = 1;
  private notificationsSubscription!: Subscription;
  public activeTab: 'all' | 'unread' = 'unread';
  public unreadNotifications: Notification[] = [];
  @ViewChild('notificationsDropdown') notificationsDropdown!: ElementRef<HTMLDivElement>;
  public showAllNotifications = false;

  private readonly notificationsService = inject(NotificationsService);
  
  get getLocalStorageToken():any{
    return localStorage.getItem('userLogin')
  }

  ngOnInit():void{
    //this.startWatchingUserLogin();
    // Si el correo esta verificado se activará el método
    if (this.authService.getEmailVerified) {
      this.isEmailVerify();
    }

    // Suscribirse a las notificaciones
    this.notificationsSubscription = this.notificationsService.notifications$.subscribe(response => {
      if (response) {
        if (this.currentPage === 1) {
          this.notifications = response.data.notifications;
        } else {
          this.notifications = [...this.notifications, ...response.data.notifications];
        }
        this.unreadCount = response.data.meta.notifications_count.unread;
        this.totalPages = response.data.meta.pagination.total_pages;
      }
    });

  // Suscripción a notificaciones no leídas
  this.notificationsService.unreadNotifications$.subscribe(response => {
    if (response) {
      this.unreadNotifications = response.data.notifications;
      this.unreadCount = response.data.meta.notifications_count.unread;
    }
  });
  
  // Carga inicial
  this.loadUnreadNotifications();

    // Cargar notificaciones iniciales
    this.loadNotifications();

    this.postService.searchQuery$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
    });
  }

  ngOnDestroy(): void {
    const element = this.notificationsDropdown?.nativeElement;
    if (element) {
      element.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

   // Nuevo método para cargar no leídas
  loadUnreadNotifications(): void {
    this.isLoadingNotifications = true;
    this.notificationsService.getUnreadNotifications().subscribe({
      complete: () => this.isLoadingNotifications = false
    });
  }

  // Cambio entre pestañas
  switchTab(tab: 'all' | 'unread'): void {
    this.activeTab = tab;
    if (tab === 'unread') {
      this.loadUnreadNotifications();
    } else {
      this.loadNotifications();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.notificationsDropdown) {
        this.setupScrollListener();
      }
    });
  }

  private setupScrollListener(): void {
    const element = this.notificationsDropdown?.nativeElement;
    if (!element) return;

    element.addEventListener('scroll', () => {
      if (this.shouldLoadMore(element)) {
        this.loadMoreNotifications();
      }
    });
  }
  
  private scrollHandler = () => {}; // Inicialización vacía
  


 // Inicialización vacía

 private shouldLoadMore(element: HTMLElement): boolean {
  return (
    !this.isLoadingNotifications &&
    this.currentPage < this.totalPages &&
    element.scrollHeight - element.scrollTop <= element.clientHeight + 100
  );
}

  constructor(private formBuilder:FormBuilder){
    this.formEliminateAccount = this.formBuilder.group({
      password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,15}$/)]),
      password_confirmation : new FormControl('', [Validators.required])
    }, {
      validators: passwordMatchValidator('password', 'password_confirmation')
    });

    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
  }


  showDialog() {
    this.visible = true;
  }


  // Mostrar el componente del login (solo si no esta autenticado)

  goLogin(open:any):void{
    this.isVisibleLogin = open;
  }

  // Mostrar el componente del register (solo si no esta autenticado)

  goRegister(open:any):void{
    this.isVisibleRegister = open;
  }

  // Cerrar sesión

  logout():void{
    this.isLoggingOut = true;
    Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Luego no podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, deseo.",
      cancelButtonText: "No, deseo."
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoadingLogout = true;
        this.authService.logout().subscribe({
          next: (s) => {
            localStorage.removeItem('userLogin');
            this.isLoadingLogout = false;
            this.alertService.miniAlert('Se cerró sesión correctamente.', 'success', 3000);
            this.visible = false;
            this.router.navigate(['menu/publicaciones']);
          },
          error: (err) => {
            this.alertService.miniAlert(err.error.message, 'error', 2500);
            localStorage.clear();
            this.isLoadingLogout = false;
          }
        })
      }
    });
  }

  get getstatusVisibleResetPassword():boolean{
    return this.authService.getstatusPassword
  }

  // Verificar si el usuario ya esta con el correo verificado

  isEmailVerify():void{
    this.alertService.miniAlert('¡Su correo electrónico se validó correctamente! 😎🥳', 'success', 3500);
  }


  startWatchingUserLogin(): void {
    setInterval(() => {
      const current = localStorage.getItem('userLogin');
      if (this.previousState && current !== this.previousState) {
        if (!this.isLoggingOut) { // ← Solo si no es cierre de sesión válido
          console.warn('⚠️ userLogin ha sido modificado o alterado.');
          this.handleSuspiciousChange();
        }
      }
      this.previousState = current;
    }, 1000);
  }

  handleSuspiciousChange(): void {
    alert('Tu sesión fue alterada. Se cerrará por seguridad.');
    localStorage.removeItem('userLogin');
    this.router.navigate(['menu/publicaciones']);
  }

  // Borrar la cuenta de un usuario

  modalConfirmationDeleteUser():void{
    this.alertService.alertwithDialogs('¿Estás seguro de eliminar tu cuenta de manera permanente?', 'Después no podras revertir esta acción', 'warning', 2500, (() => {
      if (this.getMethodRegister !== 'local') {
        this.openEliminateDialog();
        this.activeDialogEliminate2 = true; return;
      }

      this.activeDialogEliminate = true;
    }), 'No, deseo.', 'Si, deseo');
  }
  
  // Métodos para verificar cada requisito de contraseña
  get password() {
    return this.formEliminateAccount.get('password') as FormControl;
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

  // Logica para eliminar una cuenta desde un usuario cliente 

  deleteAccountUser(confirmButtonDelete?:boolean):void{
    if (this.formEliminateAccount.invalid && this.getMethodRegister === 'local') {
      this.alertService.miniAlert('Campos vacíos o inválidos.', 'info', 2500);
      this.formEliminateAccount.markAllAsTouched(); return ;
    }


    let isCorrectCodeVerification = true;
    this.activeDialogEliminate2 = true;
    this.activeDialogEliminate = false;
    
    if (this.generatedCode !== this.valueCodePasswordConfirmation && confirmButtonDelete){
      isCorrectCodeVerification = false;
      this.alertService.miniAlert('El código de verificación que ingresaste, no son iguales.', 'warning', 2500); return ;
    }else if (isCorrectCodeVerification && confirmButtonDelete){
      this.isLoadingLogout = true;

      const registration_method = JSON.parse(localStorage.getItem('userLogin')!);
      
      if (registration_method.registration_method !== 'local') {
        this.userService.deleteAccountUserbySocialNetwork().subscribe({
          next: (s) => {
            this.alertService.miniAlert('Tu cuenta se ha borrado de manera permanente, lamentamos tu perdida.', 'success', 3000);
            this.isLoadingLogout = false;
            this.activeDialogEliminate2 = false;
            this.valueCodePasswordConfirmation = '';
            localStorage.removeItem('userLogin');
            this.router.navigate(['menu/publicaciones']);
          },
          error: (err) => {
            this.activeDialogEliminate2 = false;
            this.activeDialogEliminate = true;
            this.formEliminateAccount.reset();
            this.isLoadingLogout = false;
            this.valueCodePasswordConfirmation = '';
            localStorage.removeItem('userLogin');
    
            if (err.status === 422) {
              this.alertService.showValidationErrors(err.error);
            }else{
              this.alertService.miniAlert(err.error.message, 'error', 3000);
            }
          }
        })
      }else{
        this.userService.deleteAccountUser(this.formEliminateAccount.get('password')?.value).subscribe({
            next: (s) => {
              this.alertService.miniAlert('Tu cuenta se ha borrado de manera permanente, lamentamos tu perdida. =)', 'success', 3000);
              this.isLoadingLogout = false;
              this.activeDialogEliminate2 = false;
              this.valueCodePasswordConfirmation = '';
              this.router.navigate(['menu/publicaciones']);
              this.formEliminateAccount.reset();
              localStorage.removeItem('userLogin');
            },
            error: (err) => {
              this.activeDialogEliminate2 = false;
              this.activeDialogEliminate = true;
              this.formEliminateAccount.reset();
              this.isLoadingLogout = false;
              this.valueCodePasswordConfirmation = '';
              localStorage.removeItem('userLogin');
      
              if (err.status === 422) {
                this.alertService.showValidationErrors(err.error);
              }else{
                this.alertService.miniAlert(err.error.message, 'error', 3000);
              }
            }
          })
        }
      }


  }


  // Llamar esto al abrir el diálogo
    openEliminateDialog() {
      this.generatedCode = this.generateRandomCode(6);
    }

  

  // Método para generar código numérico aleatorio de n dígitos
  generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  // Obntener metodo de registro 

  get getMethodRegister():string{
    const method = JSON.parse(localStorage.getItem('userLogin')!);
    return method?.data?.registration_method ? method?.data?.registration_method : 'local';
  }

  // Ir al componente de perfil

  goProfil(idUser?:string):void{
    this.router.navigate(['menu/perfil']);
  }

  public loadMoreNotifications(): void {
    if (this.isLoadingNotifications || this.currentPage >= this.totalPages) return;
    
    this.currentPage++;
    this.loadNotifications(this.currentPage);
  }

  
  // Obtener todas las notificaciones

  getsNotification():void{

  }


    // Cargar notificaciones
    loadNotifications(page: number = 1): void {
      if (this.isLoadingNotifications) return;
      
      this.isLoadingNotifications = true;
      this.currentPage = page;
  
      this.notificationsService.getNotifications(page).subscribe({
        next: (response) => {
          if (page === 1) {
            this.notifications = response.data.notifications;
          } else {
            this.notifications = [...this.notifications, ...response.data.notifications];
          }
          
          this.unreadCount = response.data.meta.notifications_count.unread;
          this.totalPages = response.data.meta.pagination.total_pages;
          this.isLoadingNotifications = false;
        },
        error: () => {
          this.isLoadingNotifications = false;
        }
      });
    }
  

    // Scroll infinito
  onScroll(): void {
    if (this.currentPage < this.totalPages && !this.isLoadingNotifications) {
      this.currentPage++;
      this.loadNotifications(this.currentPage);
    }
  }

  // Modifica toggleNotifications para manejar las pestañas
  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      if (this.activeTab === 'unread') {
        this.loadUnreadNotifications();
      } else {
        this.loadNotifications();
      }
    }
  }



  // Ir al componente dde ver notificacion

  goShowNotification(idNotification:string):void{
    this.router.navigate(['menu/mostrar-notificacion', idNotification])
  }

  // Marcar todas como leídas
  markAllAsRead(): void {
    if (this.unreadCount > 0) {
      this.notificationsService.markAllAsRead().subscribe({
        next: () => {
          this.loadUnreadNotifications();
          this.loadNotifications();
          this.alertService.miniAlert('Todas las notificaciones se marcaron como leídas correctamente.', 'success', 3000);
        },
        error: (err) => {
          if (err.status === 422) {
            this.alertService.showValidationErrors(err.error);
          }else{
            this.alertService.miniAlert(err.error.message, 'error', 3000);
          }
        }
      });
    }
  }

  onSearchChange(): void {
    this.postService.setSearchQuery(this.searchQuery);
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.postService.resetSearch();
  }

  onFilterChange(filters: {year: number | null, month: number | null}): void {
    this.postService.setFilters(filters);
  }

  setClickPost(): void {
    const currentValue = this.postService.isCreatePost();
    this.postService.setAddPublication(!currentValue);
  }

  
}
