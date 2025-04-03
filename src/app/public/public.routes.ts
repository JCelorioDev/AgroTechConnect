import { Routes } from "@angular/router";
import { PublicationComponent } from "./pages/publication/publication.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";

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
      }
    ]
  }
] as Routes