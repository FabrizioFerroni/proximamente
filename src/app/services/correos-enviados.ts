import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../lib/response/api-response-ok';
import { Pagination } from '../lib/interfaces/pagination';
import {
  EmailCorreoResponseDto,
  EnviosCorreosReportDto,
} from '../lib/interfaces/correos-enviados';

@Injectable()
export class CorreosEnviados extends BaseHttpService {
  constructor() {
    super();
  }

  listAllEmailsEnviados(
    page: number,
    limit: number
  ): Observable<ApiResponse<EmailCorreoResponseDto[], Pagination>> {
    return this.http.get<ApiResponse<EmailCorreoResponseDto[], Pagination>>(
      `${this.apiUrl}/correos-enviados?page=${page}&limit=${limit}`
    );
  }

  getNumbersReports(): Observable<EnviosCorreosReportDto> {
    return this.http.get<EnviosCorreosReportDto>(
      `${this.apiUrl}/correos-enviados/report`
    );
  }
}
