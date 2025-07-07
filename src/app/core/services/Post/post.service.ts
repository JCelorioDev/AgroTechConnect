import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PostInterfaceI } from '../../models/Post/postRespone.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private readonly httpClient = inject(HttpClient);

  constructor() { }

  // Obtener todas las publicaciones

  getsPost():Observable<PostInterfaceI>{
    return this.httpClient.get<PostInterfaceI>(`${environment.apiBaseUrl}posts`)
  }
}
