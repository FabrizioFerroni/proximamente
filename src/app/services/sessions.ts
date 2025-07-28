import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http';
import { Observable } from 'rxjs';
import { SessionsResponse } from '../dtos/sessions';
import { ApiResponse } from '../lib/response/api-response-ok';
import { Pagination } from '../lib/interfaces/pagination';

@Injectable({
  providedIn: 'root',
})
export class SessionsService extends BaseHttpService {
  constructor() {
    super();
  }

  getAllSessions(
    page: number,
    limit: number
  ): Observable<ApiResponse<SessionsResponse[], Pagination>> {
    return this.http.get<ApiResponse<SessionsResponse[], Pagination>>(
      `${this.apiUrl}/sessions?page=${page}&limit=${limit}`
    );
  }

  logout(jti: string): Observable<string> {
    return this.http.post<string>(
      `${this.authUrl}/cerrarsesion/jti/${jti}`,
      {}
    );
  }

  logoutAll(): Observable<string> {
    return this.http.post<string>(`${this.authUrl}/cerrarsesion/usuario`, {});
  }
}
