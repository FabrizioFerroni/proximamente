import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from './base-http';
import { Login2FaDto, LoginDto, LoginResponse } from '../dtos/login';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenService } from './token';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { cifrateData } from '../lib/functions/cifrate-data';
import { UserProfile } from '../lib/interfaces/user-profile';
import { TokenInfo } from '../lib/interfaces/token-info';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends BaseHttpService {
  private readonly tokenService = inject(TokenService);
  url: string = '';
  constructor() {
    super();
    this.url = `${this.authUrl}`;
  }

  login(body: LoginDto): Observable<LoginResponse> {
    const userEncrypt = cifrateData(this.publicKey, body);
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.post<LoginResponse>(
      `${this.authUrl}/iniciarsesion`,
      {},
      { headers }
    );
  }

  login2Fa(data: Login2FaDto): Observable<LoginResponse> {
    const userEncrypt = cifrateData(this.publicKey, data);
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.post<LoginResponse>(
      `${this.url}/iniciarsesion/2fa-verificar`,
      {},
      { headers }
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const token = this.tokenService.getCookieRefresh();
    const { token: tokenLogin, source }: TokenInfo =
      this.tokenService.getTokenLogin();

    let currentJti: string | null = null;
    if (tokenLogin) {
      try {
        const decoded: JwtPayload = jwtDecode(tokenLogin);
        currentJti = decoded.jti || null;
      } catch (err) {
        console.error('Error al decodificar el token:', err);
      }
    }

    const headers = new HttpHeaders().set('basic', token!);
    return this.http
      .post<LoginResponse>(`${this.authUrl}/refresh-token`, {}, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            const { pathname } = window.location;

            this.tokenService.logOutRefresh(pathname, currentJti!);
          }
          return throwError(() => err);
        })
      );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.authUrl}/perfil`);
  }

  validateToken(): Observable<{ valid: boolean; payload: any }> {
    return this.http.get<{ valid: boolean; payload: any }>(
      `${this.authUrl}/validate-token`
    );
  }

  generar2fa(): Observable<{ qrCodeUrl: string; secret: string }> {
    return this.http.post<{ qrCodeUrl: string; secret: string }>(
      `${this.authUrl}/2fa/generar`,
      {}
    );
  }

  active2fa(token: string): Observable<string> {
    const userEncrypt = cifrateData(this.publicKey, { token });
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.post<string>(
      `${this.authUrl}/2fa/activar`,
      {},
      { headers }
    );
  }
  desactive2fa(id: string): Observable<string> {
    const userEncrypt = cifrateData(this.publicKey, {
      id,
    });
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.post<string>(
      `${this.authUrl}/2fa/desactivar`,
      {},
      { headers }
    );
  }
}
