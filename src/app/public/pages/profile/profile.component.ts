import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { UserService } from '../../../core/services/User/user.service';
import { Data } from '../../../core/models/User/userResponse.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertService } from '../../../shared/alerts/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    PanelModule,
    TagModule,
    SkeletonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private readonly userService = inject(UserService);
  public objUser!: Data;
  public range: any = null;
  public isLoadingInfoUser: boolean = true;
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  encryptedId = toSignal(
    this.route.params.pipe(
      map(params => params['id'])
    )
  );

  ngOnInit(): void {
    if (this.encryptedId()) { 
      this.getInformationnByID();
    } else {
      this.getInformation();
    }
  }

  getInformation(): void {
    this.userService.getInformation().subscribe({
      next: (s) => {
        this.objUser = s.data;
        this.processRanges();
        this.isLoadingInfoUser = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  getInformationnByID(): void {
    this.userService.getInformationnByID(this.encryptedId()!).subscribe({
      next: (s) => {
        this.objUser = s.data;
        this.processRanges();
        this.isLoadingInfoUser = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  private processRanges(): void {
    if (this.objUser?.ranges?.length > 0) {
      this.range = this.objUser.ranges.reduce((prev, current) => 
        (current.max_range > prev.max_range) ? current : prev, 
        this.objUser.ranges[0] // Valor inicial seguro
      );
    }
  }

  private handleError(err: any): void {
    this.router.navigate(['menu/publicaciones']);
    this.alertService.miniAlert(err.error.message, 'error', 2500);
    localStorage.clear();
    this.isLoadingInfoUser = false;
  }

  hasSocialLinks(): boolean {
    if (!this.objUser?.user_information) return false;
    const links = [
      this.objUser.user_information.link1,
      this.objUser.user_information.link2,
      this.objUser.user_information.link3
    ];
    return links.some(link => link && typeof link === 'string' && link.trim() !== '');
  }

  getSocialLinks(): string[] {
    if (!this.objUser?.user_information) return [];
    return [
      this.objUser.user_information.link1,
      this.objUser.user_information.link2,
      this.objUser.user_information.link3
    ].filter(link => link && typeof link === 'string' && link.trim() !== '');
  }

  getSocialIcon(url: string): { icon: string } {
    const lower = url.toLowerCase();
    if (lower.includes('linkedin.com')) return { icon: 'pi pi-linkedin' };
    if (lower.includes('youtube.com')) return { icon: 'pi pi-youtube' };
    if (lower.includes('facebook.com')) return { icon: 'pi pi-facebook' };
    if (lower.includes('twitter.com') || lower.includes('x.com')) return { icon: 'pi pi-twitter' };
    if (lower.includes('instagram.com')) return { icon: 'pi pi-instagram' };
    return { icon: 'pi pi-link' };
  }

  
}