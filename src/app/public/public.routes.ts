import { Routes } from "@angular/router";
import { PublicationComponent } from "./pages/publication/publication.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { privateRoutes } from "../private/private.routes";
import { PreguntasComponent } from "./pages/preguntas/preguntas.component";
import { noVerificationGuard } from "../core/guards/no-verification.guard";
import { ProfileComponent } from "./pages/profile/profile.component";
import { ShowPostComponent } from "./components/show-post/show-post.component";
import { ShowCommentComponent } from "./components/show-comment/show-comment.component";




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
        path: 'publicaciones/:id',
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
      {
        path: 'perfil/:id',
        component: ProfileComponent
      },
      {
        path: 'mostrar-publicacion/:id',
        component: ShowPostComponent
      },
      {
        path: 'mostrar-comentario/:id',
        component: ShowCommentComponent
      },
      ...privateRoutes
    ]
  }
] as Routes
