import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ResponseUserI } from '../../models/User/userResponse.interface';
import { UploadPhotoResponse } from '../../models/User/uploadPhotoResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly httpClient = inject(HttpClient);
  private currentUserPhoto = new BehaviorSubject<string | null>(null);
  currentUserPhoto$ = this.currentUserPhoto.asObservable();

  constructor() { }

  // Borrar la cuenta de usuarIo (método local)

  deleteAccountUser(password:string){
    return this.httpClient.put(`${environment.apiBaseUrl}me`, {
      'password' : password
    });
  }

  // Borrar la cuenta de usuarIo (método redes sociales)

  deleteAccountUserbySocialNetwork(){
    return this.httpClient.put(`${environment.apiBaseUrl}me/social`, null);
  }

  // Mostrar la información de usurio por token

  getInformation():Observable<ResponseUserI>{
    return this.httpClient.get<ResponseUserI>(`${environment.apiBaseUrl}me/profile`);
  }

  // Mostrar la información de usurio por id usuario 

  getInformationnByID(idEncryp:string):Observable<ResponseUserI>{
    return this.httpClient.get<ResponseUserI>(`${environment.apiBaseUrl}user/profile/${idEncryp}`);
  }

  // Actualizar la foto de un usuario

  uploadPhotoUser(Photo: FormData): Observable<UploadPhotoResponse> {
    return this.httpClient.post<UploadPhotoResponse>(`${environment.apiBaseUrl}me/avatar`, Photo).pipe(
      tap(response => {
        this.currentUserPhoto.next(response.data.avatar_url);
      })
    );
  }

  updateUserPhoto(newUrl: string) {
    this.currentUserPhoto.next(newUrl);
  }

  // Eliminar la foto de perfil de usuario 

  deletePhoto(): Observable<any> {
    return this.httpClient.delete(`${environment.apiBaseUrl}me/avatar`).pipe(
      tap(() => {
        this.currentUserPhoto.next(null);
      })
    );
  }

}
