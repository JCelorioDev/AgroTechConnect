import { Routes } from "@angular/router";
import { PublicationComponent } from "./pages/publication/publication.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { privateRoutes } from "../private/private.routes";
import { PreguntasComponent } from "./pages/preguntas/preguntas.component";
import { VerifyEmailComponent } from "../shared/components/verify-email/verify-email.component";
import { PasswordRecoveryComponent } from "../auth/pages/password-recovery/password-recovery.component";


export default [
  {
    path: '',
    redirectTo: 'menu/publicaciones',
    pathMatch: 'full'
  },
  {
    path: 'menu',
    component: SidebarComponent,
    children: [
      {
        path: 'publicaciones',
        component: PublicationComponent
      },
      {
        path: 'preguntas',
        component: PreguntasComponent
      },
      {
        path: 'email/verify',
        component: VerifyEmailComponent
      },
      {
        path: 'reset-password',
        component: PasswordRecoveryComponent
      },
      ...privateRoutes
    ]
  }
] as Routes