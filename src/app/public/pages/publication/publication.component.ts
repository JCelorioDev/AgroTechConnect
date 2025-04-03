import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';



@Component({
  selector: 'app-publication',
  imports: [ButtonModule],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent {


  constructor() {}

  toggleDarkMode(){
    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('my-app-dark')
    }
  }
}
