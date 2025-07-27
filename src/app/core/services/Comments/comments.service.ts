import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommentsPublicactionResponseInterfaceTs } from '../../models/Comments/commentsPublicationResponse.interface';
import { ThemesService } from '../../../shared/services/themes.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private readonly httpClient = inject(HttpClient);

  constructor() { }

  // Obtener comentarios d euna publicacion

  getsCommentsPublication(idPublication:string):Observable<CommentsPublicactionResponseInterfaceTs>{
    return this.httpClient.get<CommentsPublicactionResponseInterfaceTs>(`${environment.apiBaseUrl}posts/${idPublication}/comments`)
  }
}
