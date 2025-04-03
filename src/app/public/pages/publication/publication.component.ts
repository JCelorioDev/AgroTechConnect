import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../../shared/services/themes.service';


@Component({
  selector: 'app-publication',
  imports: [ButtonModule],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss'
})
export class PublicationComponent {

  // Servicio para obtener los métodos de los temas
  public readonly themeService = inject(ThemeService);


  constructor() {}
}
