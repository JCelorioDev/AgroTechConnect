import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';


@Component({
  selector: 'app-publication',
  imports: [ButtonModule, ToggleSwitch],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent {


  constructor() {}



  // Para cambiar al modo dark

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('custom-dark-mode');
    }
  }


  prueba(){
    console.log('prueba');
  }

  amberSwitch = {
    handle: {
        borderRadius: '4px'
    },
    colorScheme: {
        light: {
            root: {
                checkedBackground: '{amber.500}',
                checkedHoverBackground: '{amber.600}',
                borderRadius: '4px'
            },
            handle: {
                checkedBackground: '{amber.50}',
                checkedHoverBackground: '{amber.100}'
            }
        },
        dark: {
            root: {
                checkedBackground: '{amber.400}',
                checkedHoverBackground: '{amber.300}',
                borderRadius: '4px'
            },
            handle: {
                checkedBackground: '{amber.900}',
                checkedHoverBackground: '{amber.800}'
            }
        }
    }
  };
}
