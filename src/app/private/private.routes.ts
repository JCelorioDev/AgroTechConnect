import { Routes } from "@angular/router";
import { SiguiendoComponent } from "./pages/siguiendo/siguiendo.component";
import { LogrosComponent } from "./pages/logros/logros.component";
import { PublicationComponent } from '../public/pages/publication/publication.component';
import { EditPostComponent } from "./components/edit-post/edit-post.component";
import { ShowNotificationComponent } from "./components/show-notification/show-notification.component";

export const privateRoutes = [
  {
    path: 'comunidad',
    component: SiguiendoComponent
  },
  {
    path: 'logros',
    component: LogrosComponent
  },
  {
    path: 'mis-publicaciones',
    component: PublicationComponent
  },
  {
    path: 'modificar-publicacion/:id',
    component: EditPostComponent
  },
  {
    path: 'mostrar-notificacion/:id',
    component: ShowNotificationComponent
  }
] as Routes