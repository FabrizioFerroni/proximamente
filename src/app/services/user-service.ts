import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http';
import { UserInfoUpdateDto, UserUpdatePasswordDto } from '../dtos/user';
import { cifrateData } from '../lib/functions/cifrate-data';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseHttpService {
  constructor() {
    super();
  }

  updateInfoUser(id: string, data: UserInfoUpdateDto): Observable<string> {
    const userEncrypt = cifrateData(this.publicKey, data);
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.put<string>(
      `${this.apiUrl}/user/info/${id}`,
      {},
      { headers }
    );
  }

  updatePasswordUser(
    id: string,
    data: UserUpdatePasswordDto
  ): Observable<string> {
    const userEncrypt = cifrateData(this.publicKey, data);
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.put<string>(
      `${this.apiUrl}/user/password/${id}`,
      {},
      { headers }
    );
  }
}
