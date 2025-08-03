import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token';
import { LoginService } from '../services/login';
import { TokenInfo } from '../lib/interfaces/token-info';
import { RefreshToken } from '../lib/interfaces/refresh-token';
import { Storage } from '../lib/utils/storage';
import { LoginResponse } from '../dtos/login';
import { jwtDecode, JwtPayload } from 'jwt-decode';
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const loginService = inject(LoginService);

  const { token, source }: TokenInfo = tokenService.getTokenLogin();

  let currentJti: string | null = null;
  if (token) {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      currentJti = decoded.jti || null;
    } catch (err) {
      console.error('Error al decodificar el token:', err);
    }
  }

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return loginService.refreshToken().pipe(
          switchMap(({ token, refreshToken }: LoginResponse) => {
            const body: RefreshToken = {
              oldToken: refreshToken!,
            };

            if (source === Storage.SESSION_STORAGE) {
              tokenService.setSessionStorage(token!);
            } else if (source === Storage.LOCAL_STORAGE) {
              tokenService.setLocalStorage(token!);
            }

            tokenService.setCookieRefresh(body);

            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token!}`,
              },
            });

            return next(newAuthReq);
          }),
          catchError((refreshErr) => {
            const finalError = new Error(refreshErr);

            const { pathname } = window.location;

            tokenService.logOutRefresh(pathname, currentJti!);

            return throwError(() => finalError);
          })
        );
      } else {
        return throwError(() => err);
      }
    })
  );
};
