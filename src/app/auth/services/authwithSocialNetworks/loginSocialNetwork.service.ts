import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { from, map, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginSocialNetwork {



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
        return from(user.getIdToken()).pipe(
          switchMap((token) => {

            return this.http.post(`${environment.apiBaseUrl}auth/login/google`, { token }).pipe(
              map((backendResponse: any) => ({
                firebaseUser: user,  
                backendData: backendResponse  
              }))
            );
          })
        );
      })
    );
  }



}