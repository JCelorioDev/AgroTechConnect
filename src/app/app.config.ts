import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { tokenInterceptor } from './core/interceptors/interceptor.service';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideLottieOptions } from 'ngx-lottie';


const firebaseConfig = {
  apiKey: "AIzaSyCYQsMe6DNRnXjEbFZ8cy10K7Bz66Qezl8",
  authDomain: "auth-login-ionic.firebaseapp.com",
  projectId: "auth-login-ionic",
};


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()),  providePrimeNG({
    theme: {
        preset: Aura,
        options: {
          darkModeSelector: false
        }
    }
  }),
  provideHttpClient(),
  provideAnimationsAsync(),
  provideHttpClient(withInterceptors([tokenInterceptor])),
  provideFirebaseApp(() => initializeApp(firebaseConfig)),
  provideAuth(() => getAuth()), provideLottieOptions({
    player: () => import('lottie-web'),
  })]
};
