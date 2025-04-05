import { Component, Input } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'shared-menubar',
  imports: [InputTextModule, ButtonModule, TooltipModule, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss'
})
export class MenubarComponent {
  public searchQuery: string = '';
  
}
