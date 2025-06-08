import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';


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
}
