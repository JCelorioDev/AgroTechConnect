import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PostInterfaceI } from '../../models/Post/postRespone.interface';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private httpClient: HttpClient) {}

  getsPost(page: number = 1, perPage: number = 10): Observable<PostInterfaceI> {
    return this.httpClient.get<PostInterfaceI>(
      `${environment.apiBaseUrl}posts?page=${page}&per_page=${perPage}`
    );
  }

  getPostById(id: string): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}posts/${id}`);
  }

  getPostComments(postId: string, page: number = 1): Observable<any> {
    return this.httpClient.get(
      `${environment.apiBaseUrl}posts/${postId}/comments?page=${page}`
    );
  }

  addComment(postId: string, comment: string): Observable<any> {
    return this.httpClient.post(
      `${environment.apiBaseUrl}posts/${postId}/comments`,
      { comment }
    );
  }

  addReaction(postId: string, reactionType: 'positive' | 'negative'): Observable<any> {
    return this.httpClient.post(
      `${environment.apiBaseUrl}posts/${postId}/reactions`,
      { type: reactionType }
    );
  }
}