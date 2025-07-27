import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommentsPublicactionResponseInterfaceTs } from '../../models/Comments/commentsPublicationResponse.interface';
import { ThemesService } from '../../../shared/services/themes.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseOfCommentsI } from '../../models/Comments/responseOfComments.interface';
import { ViewCommentResponse } from '../../models/Comments/viewCommentResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private readonly httpClient = inject(HttpClient);
  private opc !: string;

  constructor() { }

  // Obtener comentarios de una publicacion

  getsCommentsPublication(idPublication:string):Observable<CommentsPublicactionResponseInterfaceTs>{
    return this.httpClient.get<CommentsPublicactionResponseInterfaceTs>(`${environment.apiBaseUrl}posts/${idPublication}/comments`)
  }



  // Obtener respuesta de comentarios

  getsCommentsResponse(idComentario:string):Observable<ResponseOfCommentsI>{
    return this.httpClient.get<ResponseOfCommentsI>(`${environment.apiBaseUrl}comments/${idComentario}/replaycomments`)
  }

  // Ver un comentario

  viewComment(commentId: string): Observable<ViewCommentResponse> {
    return this.httpClient.get<ViewCommentResponse>(`${environment.apiBaseUrl}comments/${commentId}`);
  }

  // Ver respuesta de comentario

  viewResponseOfComment(commentId: string): Observable<ViewCommentResponse> {
    return this.httpClient.get<ViewCommentResponse>(`${environment.apiBaseUrl}replaycomments/${commentId}`);
  }

  get getOpc():string {
    return this.opc;
  }

  setOpc(value:string):void{
    this.opc = value;
  }

  // Denunciar un comentario

  denuncieComment(idComentario:string, description:string){
    return this.httpClient.post(`${environment.apiBaseUrl}comments/${idComentario}/complaint`, {
      description : description
    })
  }
}
