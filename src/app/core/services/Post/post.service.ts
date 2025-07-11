import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PostInterfaceI } from '../../models/Post/postRespone.interface';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  
  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$ = this.searchQuerySubject.asObservable();
  public cancelPendingRequests$ = new Subject<void>();

  constructor(private httpClient: HttpClient) {}

  setSearchQuery(query: string): void {
    this.cancelPendingRequests$.next(); // Cancela peticiones pendientes
    this.searchQuerySubject.next(query);
  }
  
  resetSearch(): void {
    this.searchQuerySubject.next(''); // Emite un string vacío para resetear
  }

  // Obtener todas las publicaciones

  getsPost(page: number = 1, perPage: number = 10, searchQuery: string = ''): Observable<PostInterfaceI> {
    this.cancelPendingRequests$.next(); // Cancela peticiones anteriores
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    return this.httpClient.get<PostInterfaceI>(`${environment.apiBaseUrl}posts`, { params })
      .pipe(takeUntil(this.cancelPendingRequests$));
  }

  // Obtener mis publicaciones

  getsMePost(page: number = 1, perPage: number = 10, searchQuery: string = ''): Observable<PostInterfaceI> {
    this.cancelPendingRequests$.next(); // Cancela peticiones anteriores
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    return this.httpClient.get<PostInterfaceI>(`${environment.apiBaseUrl}me/posts`, { params })
      .pipe(takeUntil(this.cancelPendingRequests$));
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