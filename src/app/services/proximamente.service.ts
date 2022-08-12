import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProximamenteService {

  public url: any;
  constructor(
    private httpClient:HttpClient
  ) {
    this.url = environment.url;
  }


  post_suscribirse(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.post(this.url + 'suscribirme', data, { headers: headers });
  }

 get_unsusscribe(email:any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.get(this.url + 'darse-de-baja/' + email,  { headers: headers });
  }

  post_unsusscribe(email:any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.post(this.url + 'darse-de-baja/' + email,  { headers: headers });
  }

}
