import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/Auth/auth.service';


@Component({
  selector: 'app-publication',
  imports: [ButtonModule],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent {



  constructor() {}


  prueba(){
    console.log('prueba');
  }

  ngOnInit():void{

  }


}
