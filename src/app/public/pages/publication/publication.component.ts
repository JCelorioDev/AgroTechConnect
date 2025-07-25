import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AlertService } from '../../../shared/alerts/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { AddPostComponent } from '../../components/add-post/add-post.component';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../core/services/Post/post.service';

@Component({
  selector: 'public-publication',
  standalone: true,
  imports: [
    PostComponent, AddPostComponent, CommonModule
  ],
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public isMePublication = signal<boolean>(false);
  public showAddPost = signal<boolean>(false);
  private readonly postsService = inject(PostService);

  constructor(){
    effect(() => {
      this.showAddPost.set(this.postsService.getIsCreatePost());
    });
  }

  ngOnInit():void{
    const currentUrl = this.router.url.split('?')[0];
    const segments = currentUrl.split('/').filter(Boolean); 
    const childRoute = segments[segments.length - 1]; 



    if (childRoute === 'mis-publicaciones') {
      this.isMePublication.set(true);
    }
  }
}