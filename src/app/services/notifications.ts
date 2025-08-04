import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http';
import { Observable } from 'rxjs';
import {
  CNotificationResponse,
  CreateNotificationDto,
  NotificationReportDto,
  NotifyResponseDto,
} from '../dtos/notify.dto';
import { ApiResponse } from '../lib/response/api-response-ok';
import { Pagination } from '../lib/interfaces/pagination';
import { HttpHeaders } from '@angular/common/http';
import { cifrateData } from '../lib/functions/cifrate-data';

@Injectable({
  providedIn: 'root',
})
export class Notifications extends BaseHttpService {
  constructor() {
    super();
  }

  getNumbersReports(): Observable<NotificationReportDto> {
    return this.http.get<NotificationReportDto>(`${this.apiUrl}/admin/report`);
  }

  getNotifications(
    page: number,
    limit: number
  ): Observable<ApiResponse<NotifyResponseDto[], Pagination>> {
    return this.http.get<ApiResponse<NotifyResponseDto[], Pagination>>(
      `${this.apiUrl}/admin/notifications?page=${page}&limit=${limit}`
    );
  }

  exportNotifications(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/export`, {
      responseType: 'blob',
    });
  }

  createNotification(
    dto: CreateNotificationDto
  ): Observable<CNotificationResponse> {
    const userEncrypt = cifrateData(this.publicKey, dto);
    const headers = new HttpHeaders().set('basic', userEncrypt);
    return this.http.post<CNotificationResponse>(
      `${this.apiUrl}/notify`,
      {},
      { headers }
    );
  }

  desubscribe(token: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/unsubscribe/${token}`, {});
  }

  notifyMail(): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.apiUrl}/notification/send/online`,
      {}
    );
  }
}
