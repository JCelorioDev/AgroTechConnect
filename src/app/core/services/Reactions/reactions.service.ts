import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ReactionsResponseI } from '../../models/Reactions/reactionsResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class ReactionsService {

  private readonly httpClient = inject(HttpClient);

  constructor() { }

  // Ver reacciones de una publicacion

  getsReactionsPost(idPublicacion:string):Observable<ReactionsResponseI>{
    return this.httpClient.get<ReactionsResponseI>(`${environment.apiBaseUrl}posts/${idPublicacion}/reactions`)
  }
}
