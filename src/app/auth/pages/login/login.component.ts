import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'auth-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Dialog, ButtonModule, CheckboxModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public visible: boolean = true;
  googleChecked: boolean = false;
  facebookChecked: boolean = true;

  @Output() visibleModal = new EventEmitter<boolean>();

  constructor(){

  }


  showDialog() {

  }

  ngOnInit():void{

  }

  onDialogHide() {
    this.visible = false;
    this.visibleModal.emit(false);
  }
}
