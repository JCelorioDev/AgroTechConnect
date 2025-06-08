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



@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    PanelModule,
    TagModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  private readonly userService = inject(UserService);
  public objUser!:Data;
  public range!:any;
  

  ngOnInit():void{
    this.getInformation();
  }


  profile = {
    name: 'Daniel Rojas Agtech',
    username: '@DroneCropXpert',
    description: 'Ing. Agrónomo | Especialista en drones agrícolas',
    rank: 'INICIADO',
    avatar: 'https://i.ibb.co/f2YfPBk/avatar.png', // Pon aquí tu URL real
    rankIcon: 'https://i.ibb.co/YdWzWrX/rank-icon.png',
    likes: 500,
    comments: 12,
    followers: 50,
    linkedin: 'https://linkedin.com/in/DanielDrone',
    youtube: 'https://youtube.com/@DanielDrone'
  };

    // Mostrar la información de usurio por token

    getInformation():void{
      this.userService.getInformation().subscribe({
        next: (s) => {
          this.objUser = s.data;
          this.range = this.objUser.ranges.reduce((prev, current) => {
            return current.max_range > prev.max_range ? current : prev;
          });
          
        },
        error: (err) => {

        }
      })
    }
}
