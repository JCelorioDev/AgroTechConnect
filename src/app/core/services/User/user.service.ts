import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ResponseUserI } from '../../models/User/userResponse.interface';
import { UploadPhotoResponse } from '../../models/User/uploadPhotoResponse.interface';
import { updatePasswordRequest } from '../../models/User/updatePasswordRequest.interface';
import { UpdatePasswodResponse } from '../../models/User/updatePassword.interface';
import { ShowInformationOpcResponse } from '../../models/User/showInformationOpcResponse.interface';
import { UpdateInformationOpcResponseInterface } from '../../models/User/updateInformationOpcResponse.interface';
import { updateInformationProfileRequest } from '../../models/User/updateInformationProfileRequest.interface';
import { FollowUserResponse } from '../../models/User/followUserResponse.interface';
import { MefollowersResponse } from '../../models/User/mefollowersResponse.interface';

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
        this.currentUserPhoto.next(''); // Usamos string vacío para indicar foto eliminada
      })
    );
  }

  // Actualizar la contraseña de usuario

  updatePassword(FormUpdatePassword:updatePasswordRequest):Observable<UpdatePasswodResponse>{
      return this.httpClient.put<UpdatePasswodResponse>(`${environment.apiBaseUrl}me/password`, FormUpdatePassword)
  }

  // Mostrar la información adicional de usuario

  showInformationOpc():Observable<ShowInformationOpcResponse>{
    return this.httpClient.get<ShowInformationOpcResponse>(`${environment.apiBaseUrl}me/user-information`)
  }

  // Actualizar la información adicional de usuario 

  updateInformation(FormUpdateInformation:updateInformationProfileRequest):Observable<UpdateInformationOpcResponseInterface>{
    return this.httpClient.post<UpdateInformationOpcResponseInterface>(`${environment.apiBaseUrl}me/user-information`, FormUpdateInformation)
  }


  // Seguir a un usuario

  followAuser(idUser:string):Observable<FollowUserResponse>{
    return this.httpClient.post<FollowUserResponse>(`${environment.apiBaseUrl}users/follow`, {
      user_id : idUser
    })
  }

  // Ver mis seguidores

  mefollowers():Observable<MefollowersResponse>{
    return this.httpClient.get<MefollowersResponse>(`${environment.apiBaseUrl}me/followers`)
  }


  // Ver mis seguidos
}
