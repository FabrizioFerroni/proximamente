import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Storage } from '../lib/utils/storage';
import { CryptoService } from './crypto';
import { TokenInfo } from '../lib/interfaces/token-info';
import { RefreshToken } from '../lib/interfaces/refresh-token';
import { cifrateData } from '../lib/functions/cifrate-data';
import { BaseHttpService } from './base-http';
import { environment } from '../../environments/environment';
import { UserProfile } from '../lib/interfaces/user-profile';
import { Rutas } from '../lib/utils/rutas';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA = 'profile';
@Injectable({
  providedIn: 'root',
})
export class TokenService extends BaseHttpService {
  private tokenInfo: TokenInfo = {
    token: null,
    source: Storage.NONE,
  };
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);
  private readonly cryptoService = inject(CryptoService);

  setLoginSecret(loginSecret: string): void {
    sessionStorage.setItem('loginSecret', loginSecret);
  }

  getLoginSecret(): string | null {
    return sessionStorage.getItem('loginSecret') || null;
  }

  deleteLoginSecret(): void {
    sessionStorage.removeItem('loginSecret');
  }

  setRemember(remember: boolean): void {
    sessionStorage.setItem('remember', remember.toString());
  }

  getRemember(): string | boolean {
    return sessionStorage.getItem('remember') || false;
  }

  deleteRemember(): void {
    sessionStorage.removeItem('remember');
  }

  setUserLS(user: UserProfile): void {
    this.deleteUserLS();
    localStorage.setItem(USER_DATA, JSON.stringify(user));
  }

  getUserLS(): UserProfile | null {
    return JSON.parse(localStorage.getItem(USER_DATA) || 'null') || null;
  }

  deleteUserLS(): void {
    localStorage.removeItem(USER_DATA);
  }

  setLocalStorage(token: string): void {
    this.deleteLocalStorage();
    localStorage.setItem(TOKEN_KEY, token);
  }

  getLocalToken(): string {
    return localStorage.getItem(TOKEN_KEY)!;
  }

  deleteLocalStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  setUserSS(user: UserProfile): void {
    this.deleteUserSS();
    sessionStorage.setItem(USER_DATA, JSON.stringify(user));
  }

  getUserSS(): UserProfile | null {
    return JSON.parse(sessionStorage.getItem(USER_DATA) || 'null') || null;
  }

  deleteUserSS(): void {
    sessionStorage.removeItem(USER_DATA);
  }

  setSessionStorage(token: string): void {
    this.deleteSessionStorage();
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getSessionToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY) || null;
  }

  deleteSessionStorage(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  setCookieRefresh(body: RefreshToken): void {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    const tokenCifred = cifrateData(this.publicKey, body);

    const recifredToken = this.cryptoService.encryptToken(tokenCifred);

    const domain = window.location.hostname;
    const secure = environment.secureCookie;

    this.cookieService.set(
      REFRESH_TOKEN_KEY,
      recifredToken,
      expires,
      '/',
      domain,
      secure,
      'Strict'
    );
  }

  getCookieRefresh(): string | null {
    const tokenCookie = this.cookieService.get(REFRESH_TOKEN_KEY) || null;
    const tokenDecifred = this.cryptoService.decryptToken(tokenCookie!);
    return tokenDecifred;
  }

  deleteCookieRefresh(): void {
    this.cookieService.delete(REFRESH_TOKEN_KEY);
  }

  isLogged(): boolean {
    if (this.getSessionToken() || this.getLocalToken()) {
      return true;
    }
    return false;
  }

  getTokenLogin(): TokenInfo {
    const sessionToken = this.getSessionToken();
    const localToken = this.getLocalToken();

    if (sessionToken) {
      this.tokenInfo = { token: sessionToken, source: Storage.SESSION_STORAGE };
    } else if (localToken) {
      this.tokenInfo = { token: localToken, source: Storage.LOCAL_STORAGE };
    } else {
      this.tokenInfo = { token: null, source: Storage.NONE };
    }
    return this.tokenInfo;
  }

  logOut(jti?: string): void {
    if (this.getSessionToken() && !this.getLocalToken()) {
      this.http
        .post(`${this.authUrl}/cerrarsesion${jti ? `/jti/${jti}` : ''}`, {})
        .subscribe();
      this.deleteSessionStorage();
      this.deleteUserSS();
    } else if (this.getLocalToken() && !this.getSessionToken()) {
      this.http
        .post(`${this.authUrl}/cerrarsesion${jti ? `/jti/${jti}` : ''}`, {})
        .subscribe();
      this.deleteLocalStorage();
      this.deleteUserLS();
    }

    this.deleteCookieRefresh();

    this.router.navigateByUrl(`/${Rutas.LOGIN}`);
  }

  logOutAllSessions(): void {
    if (this.getSessionToken() && !this.getLocalToken()) {
      // this.http.post(`${this.authUrl}/cerrarsesion/usuario`, {}).subscribe();
      this.deleteSessionStorage();
      this.deleteUserSS();
    } else if (this.getLocalToken() && !this.getSessionToken()) {
      // this.http.post(`${this.authUrl}/cerrarsesion/usuario`, {}).subscribe();
      this.deleteLocalStorage();
      this.deleteUserLS();
    }

    this.deleteCookieRefresh();

    this.router.navigateByUrl(`/${Rutas.LOGIN}`);
  }

  logOutRefresh(url: string, jti: string): void {
    if (this.getSessionToken() && !this.getLocalToken()) {
      this.http.post(`${this.authUrl}/cerrarsesion/jti/${jti}`, {}).subscribe();
      this.deleteSessionStorage();
      this.deleteUserSS();
    } else if (this.getLocalToken() && !this.getSessionToken()) {
      this.http.post(`${this.authUrl}/cerrarsesion/jti/${jti}`, {}).subscribe();
      this.deleteLocalStorage();
      this.deleteUserLS();
    }

    this.deleteCookieRefresh();

    this.router.navigateByUrl(`/${Rutas.LOGIN}#redirect=${url}`);
  }
}
