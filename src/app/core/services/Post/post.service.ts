import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Datum, PostInterfaceI } from '../../models/Post/postRespone.interface';
import { filter, takeUntil, distinctUntilChanged, tap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { AddedPostRequestI } from '../../models/Post/addedPostRequest.interface';
import { AddedPostI } from '../../models/Post/addedPost.interface';
import { DeleteMePostResponseI } from '../../models/Post/deleteMePost.interface';
import { ShowPostResponse } from '../../models/Post/showPostResponse.interface';

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

  // Obtener publicaciones de un usuario en especifico

  getPublicationbyID(page: number = 1,
    perPage: number = 10,
    searchQuery: string = '',
    year: number | null = null,
    month: number | null = null,
    idPublication:string
    ):Observable<PostInterfaceI>{
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

    return this.httpClient.get<PostInterfaceI>(`${environment.apiBaseUrl}users/${idPublication}/posts`, { params })
      .pipe(takeUntil(this.cancelPendingRequests$));
  }

  // Obtener publicaciones de mis seguidos

  getPostMeFollowings(page: number = 1,
    perPage: number = 10,
    searchQuery: string = '',
    year: number | null = null,
    month: number | null = null,
    ):Observable<PostInterfaceI>{
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

    return this.httpClient.get<PostInterfaceI>(`${environment.apiBaseUrl}me/following/posts`, { params })
      .pipe(takeUntil(this.cancelPendingRequests$));
  }

  // Crear una publicacion
  private newPostSubject = new BehaviorSubject<any | null>(null);
  public newPost$ = this.newPostSubject.asObservable();

  // Modifica el método addPost para emitir el nuevo post
  addPost(formPost: AddedPostRequestI): Observable<AddedPostI> {
    const formData = new FormData();

    formData.append('title', formPost.title);
    formData.append('description', formPost.description);

    formPost.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file, file.name);
    });

    return this.httpClient.post<AddedPostI>(`${environment.apiBaseUrl}posts`, formData).pipe(
      tap(response => {
        // Emitimos el nuevo post creado
        this.newPostSubject.next(response.data);
      })
    );
  }

  // Eliminar una publicación

  deleteMePost(idPublicacion:string):Observable<DeleteMePostResponseI>{
    return this.httpClient.delete<DeleteMePostResponseI>(`${environment.apiBaseUrl}posts/${idPublicacion}`)
  }

  // Mostrar una publicacion

  showPost(idPublication:string):Observable<ShowPostResponse>{
    return this.httpClient.get<ShowPostResponse>(`${environment.apiBaseUrl}posts/${idPublication}`)
  }

  // Update post

  updatePost(formPost: AddedPostRequestI,idPublication:string){
    const formData = new FormData();

    formData.append('title', formPost.title);
    formData.append('description', formPost.description);

    formPost.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file, file.name);
    });
    return this.httpClient.post(`${environment.apiBaseUrl}posts/${idPublication}`,formData)
  }

  // Eliminar todas las fotos de una publicacion

  deleteAllPhotos(idPublication:string){
    return this.httpClient.delete(`${environment.apiBaseUrl}posts/${idPublication}/images`)
  }

  // Eliminar una imagen de una publicacion

  deleteOnePhoto(idPublicacion:string, imageId:string){
    return this.httpClient.delete(`${environment.apiBaseUrl}posts/${idPublicacion}/images/${imageId}`)
  }

  // Denunciar una publicacion

  reportPublication(idPublicacion:string, description:string){
    return this.httpClient.post(`${environment.apiBaseUrl}posts/${idPublicacion}/complaint`, {
      description : description
    })
  }

}