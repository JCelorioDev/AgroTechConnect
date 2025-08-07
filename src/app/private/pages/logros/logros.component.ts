import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/User/user.service';
import { Range } from '../../../core/models/User/userResponse.interface';
import { User } from '../../../core/models/Comments/commentsPublicationResponse.interface';
import { AlertService } from '../../../shared/alerts/alert.service';
import { CardModule } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';


@Component({
  selector: 'app-logros',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ProgressBar,
    TooltipModule,
    SkeletonModule,
    DividerModule,
    BadgeModule,
    AvatarModule,
    LottieComponent
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

  options: AnimationOptions = {
    path: 'anim/chicky_animation.json',
  };


  constructor() {
    this.objUsuario = JSON.parse(localStorage.getItem('userLogin')!);
  }

  ngOnInit(): void {
    if(this.objUsuario){
      this.getRangeUser();
    }
  }

  getRangeUser(): void {
    this.loading = true;
    this.userService.getInformationnByID(this.objUsuario?.id).subscribe({
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

  getProgressPercentage(): number {
    return 100; 
  }

  isCurrentRange(range: Range): boolean {
    return true ;
  }
  

  get isRangeCompleted(): boolean {
    return true;
  }

  styles: Partial<CSSStyleDeclaration> = {
    maxWidth: '500px',
    margin: '0 auto',
  };
}