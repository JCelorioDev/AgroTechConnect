import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ReactionsResponseI } from '../../models/Reactions/reactionsResponse.interface';
import { ReactionsCommentResponseI } from '../../models/Reactions/reactionsCommentResponse.interface';
import { ReactionsReplayCommentResponse } from '../../models/Reactions/reactionsReplayCommentResponse.interface';

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

  // Ver reacciones de un comentario

  getReactionsComment(idComentario:string):Observable<ReactionsCommentResponseI>{
    return this.httpClient.get<ReactionsCommentResponseI>(`${environment.apiBaseUrl}comments/${idComentario}/reactions`)
  }


  // Ver reacciones de una respuesta de comentario

  getReplayReactionsComment(idComentario:string):Observable<ReactionsReplayCommentResponse>{
    return this.httpClient.get<ReactionsReplayCommentResponse>(`${environment.apiBaseUrl}replaycomments/${idComentario}/reactions`)
  }


}
