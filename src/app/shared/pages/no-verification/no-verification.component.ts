import { Component } from '@angular/core';

@Component({
  selector: 'no-verification',
  imports: [],
  standalone: true,
  templateUrl: './no-verification.component.html',
  styleUrl: './no-verification.component.scss'
})
export class NoVerificationComponent {
  private previousState: string | null = null;

  ngOnInit(): void {
    this.startWatchingUserLogin();
  }

  startWatchingUserLogin(): void {
    setInterval(() => {
      const current = localStorage.getItem('userLogin');
      if (this.previousState && current !== this.previousState) {
        console.warn('⚠️ userLogin ha sido modificado o alterado.');
        this.handleSuspiciousChange();
      }
      this.previousState = current;
    }, 1000);
  }

  handleSuspiciousChange(): void {
    alert('Tu sesión fue alterada. Se cerrará por seguridad.');
    localStorage.removeItem('userLogin');
    window.location.href = 'menu/publicaciones'; 
  }
}
