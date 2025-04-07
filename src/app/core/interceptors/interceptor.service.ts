import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const userLogin = localStorage.getItem('userLogin');

  if (!userLogin) {
    return next(req);
  }

  let token;
  try {
    token = JSON.parse(userLogin);
  } catch (e) {
    return next(req);
  }

  if (token && token.token) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);
    const reqClone = req.clone({ headers });
    return next(reqClone);
  }else{
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token.data.token}`);
    const reqClone = req.clone({ headers });
    return next(reqClone);
  }


  return next(req);
};