import { Component, inject, OnInit } from '@angular/core';
import { AlertService } from '../../../shared/alerts/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { AddPostComponent } from '../../components/add-post/add-post.component';

@Component({
  selector: 'public-publication',
  standalone: true,
  imports: [
    PostComponent, AddPostComponent
  ],
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent {
  ngOnInit():void{
    
  }
}