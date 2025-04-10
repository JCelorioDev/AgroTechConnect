import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-recovery',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.scss'
})
export class PasswordRecoveryComponent {

  @Output() visibleModalRecoveryPassword = new EventEmitter<boolean>();

  
}
