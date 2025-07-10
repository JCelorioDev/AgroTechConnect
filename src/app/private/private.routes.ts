import { Routes } from "@angular/router";
import { SiguiendoComponent } from "./pages/siguiendo/siguiendo.component";
import { LogrosComponent } from "./pages/logros/logros.component";
import { PublicationComponent } from '../public/pages/publication/publication.component';

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
  }
] as Routes