import { Routes } from "@angular/router";
import { PublicationComponent } from "./pages/publication/publication.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { privateRoutes } from "../private/private.routes";
import { PreguntasComponent } from "./pages/preguntas/preguntas.component";
import { noVerificationGuard } from "../core/guards/no-verification.guard";
import { ProfileComponent } from "./pages/profile/profile.component";




export default [
  {
    path: '',
    redirectTo: 'menu/publicaciones',
    pathMatch: 'full'
  },
  {
    path: 'menu',
    component: SidebarComponent,
    canActivate: [noVerificationGuard],
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
        path: 'perfil',
        component: ProfileComponent
      },
      ...privateRoutes
    ]
  }
] as Routes
