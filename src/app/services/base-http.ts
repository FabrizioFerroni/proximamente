import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  readonly http = inject(HttpClient);
  readonly apiUrl = environment.api;
  readonly authUrl = environment.auth;
  readonly publicKey = environment.pathCert;
}
