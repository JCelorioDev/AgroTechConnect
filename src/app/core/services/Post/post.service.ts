import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PostInterfaceI } from '../../models/Post/postRespone.interface';
import { filter, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostService implements OnDestroy {
  private searchQuerySubject = new BehaviorSubject<string>('');
  private filtersSubject = new BehaviorSubject<{year: number | null, month: number | null}>({year: null, month: null});
  public searchQuery$ = this.searchQuerySubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();
  public cancelPendingRequests$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private currentView: 'public' | 'private' = 'public';

  constructor(private httpClient: HttpClient, private router: Router) {
    this.setupRouteListener();
    this.setupViewChangeHandler();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cancelPendingRequests$.next();
    this.cancelPendingRequests$.complete();
  }

  private setupRouteListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged((prev: NavigationEnd, curr: NavigationEnd) => 
        prev.url === curr.url),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const newView = event.url.includes('mis-publicaciones') ? 'private' : 'public';
      
      if (this.currentView !== newView) {
        this.resetSearch();
        this.resetFilters();
      }
      
      this.currentView = newView;
    });
  }

  private setupViewChangeHandler(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged((prev: NavigationEnd, curr: NavigationEnd) => 
        prev.urlAfterRedirects === curr.urlAfterRedirects),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const newView = event.url.includes('mis-publicaciones') ? 'private' : 'public';
      if (this.currentView !== newView) {
        this.resetSearch();
        this.resetFilters();
      }
      this.currentView = newView;
    });
  }


  setSearchQuery(query: string): void {
    this.cancelPendingRequests$.next();
    this.searchQuerySubject.next(query.trim());
  }

  setFilters(filters: {year: number | null, month: number | null}): void {
    this.filtersSubject.next(filters);
  }

  resetFilters(): void {
    this.filtersSubject.next({year: null, month: null});
  }

  resetSearch(): void {
    this.searchQuerySubject.next('');
    this.cancelPendingRequests$.next();
  }

  getsPost(
    page: number = 1, 
    perPage: number = 10, 
    searchQuery: string = '',
    year: number | null = null,
    month: number | null = null
  ): Observable<PostInterfaceI> {
    this.cancelPendingRequests$.next();
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    if (year) {
      params = params.set('year', year.toString());
    }

    if (month) {
      params = params.set('month', month.toString());
    }

    return this.httpClient.get<PostInterfaceI>(`${environment.apiBaseUrl}posts`, { params })
      .pipe(takeUntil(this.cancelPendingRequests$));
  }

  getsMePost(
    page: number = 1, 
    perPage: number = 10, 
    searchQuery: string = '',
    year: number | null = null,
    month: number | null = null
  ): Observable<PostInterfaceI> {
    this.cancelPendingRequests$.next();
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    if (year) {
      params = params.set('year', year.toString());
    }

    if (month) {
      params = params.set('month', month.toString());
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