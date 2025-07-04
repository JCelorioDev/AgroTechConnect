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
import { MeFollowingResponse } from '../../models/User/mefollowingResponse.interface';
import { Followers } from '../../models/User/followersResponse.interface';
import { FollowingResponse } from '../../models/User/followingsResponse.interface';
import { UnfollowUser } from '../../models/User/unfollowResponse.interface';


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

  // Dejar de seguir a un usuario

  unFollow(idUsuario: string): Observable<UnfollowUser> {
    return this.httpClient.delete<UnfollowUser>(
      `${environment.apiBaseUrl}users/unfollow`, 
      {
        params: { user_id: idUsuario } 
      }
    );
  }

  // Ver mis seguidores

  mefollowers(page: number = 1):Observable<MefollowersResponse>{
      return this.httpClient.get<MefollowersResponse>(`${environment.apiBaseUrl}me/followers?page=${page}`);
  }


  // Ver mis seguidos

  meFollowing(page:number = 1):Observable<MeFollowingResponse>{
    return this.httpClient.get<MeFollowingResponse>(`${environment.apiBaseUrl}me/following?page=${page}`);
  }

  // Ver seguidores de otro usuario

  followers(idUser: string, page: number = 1): Observable<Followers> {
    return this.httpClient.get<Followers>(
        `${environment.apiBaseUrl}users/${idUser}/followers?page=${page}`
    );
}

  // Ver seguidos de otro usuario

  followings(idUser: string, page: number = 1): Observable<FollowingResponse> {
    return this.httpClient.get<FollowingResponse>(
        `${environment.apiBaseUrl}users/${idUser}/following?page=${page}`
    );
}
}
