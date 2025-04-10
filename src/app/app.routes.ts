import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./public/public.routes')
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes')
  }
];
