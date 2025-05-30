import { inject, Injectable } from '@angular/core';
import { Auth, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { from, map, switchMap } from 'rxjs';
import { AlertService } from '../../../shared/alerts/alert.service';

@Injectable({ providedIn: 'root' })
export class LoginSocialNetwork {

  public readonly toastService = inject(AlertService);

  constructor(private auth: Auth, private http: HttpClient) {}

  async loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const token = await result.user.getIdToken(); 


    let apiBaseUrl = environment.apiBaseUrl;
    return this.http.post(`${apiBaseUrl}auth/login/facebook`, { token });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((result) => {
        const user = result.user;
        
        this.isLoadingGoogle(true);
        return from(user.getIdToken()).pipe(
          switchMap((token) => {
            return this.http.post(`${environment.apiBaseUrl}auth/login/google`, { token }).pipe(
              map((backendResponse: any) => {
                this.toastService.miniAlert('Inicio de sesión con Google exitoso', 'success', 2500);
  
                return {
                  firebaseUser: user,
                  backendData: backendResponse
                };
              })
            );
          })
        );
      })
    );
  }

  private loading:boolean = false;


  isLoadingGoogle(value:boolean):void{
    this.loading = value;
  }
  


  get getisLoadingGoogle():boolean{
    return this.loading;
  }



}