import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/User/user.service';
import { Range } from '../../../core/models/User/userResponse.interface';
import { User } from '../../../core/models/Comments/commentsPublicationResponse.interface';
import { AlertService } from '../../../shared/alerts/alert.service';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-logros',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ProgressBarModule,
    TooltipModule,
    SkeletonModule,
    DividerModule,
    BadgeModule,
    AvatarModule
  ],
  templateUrl: './logros.component.html',
  styleUrls: ['./logros.component.scss']
})
export class LogrosComponent {
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);
  
  public ranges: Range[] = [];
  public objUsuario!: User;
  public loading: boolean = true;
  public currentPoints: number = 0; // Asume que tienes esta información del usuario

  constructor() {
    this.objUsuario = JSON.parse(localStorage.getItem('userLogin')!);
    // Aquí deberías obtener los puntos actuales del usuario si están disponibles
    // this.currentPoints = this.objUsuario.points || 0;
  }

  ngOnInit(): void {
    this.getRangeUser();
  }

  getRangeUser(): void {
    this.loading = true;
    this.userService.getInformationnByID(this.objUsuario.id).subscribe({
      next: (response) => {
        this.ranges = response.data.ranges;
        this.ranges.sort((a, b) => a.min_range - b.min_range);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.alertService.showValidationErrors(err.error);
        } else {
          this.alertService.miniAlert(err.error.message, 'error', 3000);
        }
      }
    });
  }

  getProgressPercentage(range: Range): number {
    if (this.currentPoints >= range.max_range) return 100;
    if (this.currentPoints <= range.min_range) return 0;
    return ((this.currentPoints - range.min_range) / (range.max_range - range.min_range)) * 100;
  }

  isCurrentRange(range: Range): boolean {
    return this.currentPoints >= range.min_range && this.currentPoints < range.max_range;
  }

  isRangeCompleted(range: Range): boolean {
    return this.currentPoints >= range.max_range;
  }
}