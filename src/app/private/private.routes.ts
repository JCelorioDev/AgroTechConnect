import { Routes } from "@angular/router";
import { SiguiendoComponent } from "./pages/siguiendo/siguiendo.component";
import { LogrosComponent } from "./pages/logros/logros.component";

export const privateRoutes = [
  {
    path: 'siguiendo',
    component: SiguiendoComponent
  },
  {
    path: 'logros',
    component: LogrosComponent
  }
] as Routes