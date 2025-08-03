import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommentsPublicactionResponseInterfaceTs } from '../../models/Comments/commentsPublicationResponse.interface';
import { ThemesService } from '../../../shared/services/themes.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseOfCommentsI } from '../../models/Comments/responseOfComments.interface';
import { ViewCommentResponse } from '../../models/Comments/viewCommentResponse.interface';
import { CreateCommentInPostReponseI } from '../../models/Comments/createCommentInPost.interface';
import { requestCommentsPublicationResponseI } from '../../models/Comments/requestCommentsPublicationResponse.interface';
import { EditCommentInPostI } from '../../models/Comments/editCommentInPost.interface';
import { CreateReplayCommentI } from '../../models/Comments/createReplayComment.interface';

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

  getsCommentsResponse(idComentario: string, page: number = 1): Observable<ResponseOfCommentsI> {
    return this.httpClient.get<ResponseOfCommentsI>(
      `${environment.apiBaseUrl}comments/${idComentario}/replaycomments?page=${page}`
    );
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

  // Denunciar respuesta de comentario

  denuncieReplayComment(idComentario:string, description:string){
    return this.httpClient.post(`${environment.apiBaseUrl}replaycomments/${idComentario}/complaint`, {
      description : description
    })
  }

  // Crear comentario en publicacion

  commentInPost(idPublicacion: string, data: FormData): Observable<CreateCommentInPostReponseI> {
    return this.httpClient.post<CreateCommentInPostReponseI>(
      `${environment.apiBaseUrl}posts/${idPublicacion}/comments`, 
      data
    );
  }

  // Editar comentario de una publicacion

  editCommentInPost(idPublicacion:string, idComentario:string, data: FormData):Observable<EditCommentInPostI>{
    return this.httpClient.post<EditCommentInPostI>(`${environment.apiBaseUrl}posts/${idPublicacion}/comments/${idComentario}`, data);
  }

  // Crear repuesta de comentario

  createReplayComment(idPublicacion: string, idComentario: string, data: FormData): Observable<CreateReplayCommentI> {
    return this.httpClient.post<CreateReplayCommentI>(
      `${environment.apiBaseUrl}posts/${idPublicacion}/comments/${idComentario}/replaycomments`, 
      data
    );
  }

  // Eliminar un comentario

  deleteComment(idComentario:string){
    return this.httpClient.delete(`${environment.apiBaseUrl}comments/${idComentario}`)
  }

  // Eliminar repsuesta de comentario 

  deleteReplayComment(idComentario:string){
    return this.httpClient.delete(`${environment.apiBaseUrl}replaycomments/${idComentario}`)
  }
}
