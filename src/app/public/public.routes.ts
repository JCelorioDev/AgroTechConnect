import { Routes } from "@angular/router";
import { PublicationComponent } from "./pages/publication/publication.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { privateRoutes } from "../private/private.routes";
import { PreguntasComponent } from "./pages/preguntas/preguntas.component";
import { noVerificationGuard } from "../core/guards/no-verification.guard";




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
        component: PublicationComponent,
        canActivate: [noVerificationGuard]
      },
      {
        path: 'preguntas',
        component: PreguntasComponent
      },
      ...privateRoutes
    ]
  }
] as Routes
