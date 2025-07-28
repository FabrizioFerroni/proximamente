import { Component, inject, OnInit } from '@angular/core';
import { CorreosEnviados } from '../../services/correos-enviados';
import {
  EmailCorreoResponseDto,
  EnviosCorreosReportDto,
} from '../../lib/interfaces/correos-enviados';
import {
  Calendar,
  CheckCheck,
  Download,
  Loader2,
  LucideAngularModule,
  Mail,
  Users,
  X,
} from 'lucide-angular';
import { Rutas } from '../../lib/utils/rutas';
import { LoginService } from '../../services/login';
import { TokenService } from '../../services/token';
import { Pagination } from '../../lib/interfaces/pagination';
import { ApiResponse } from '../../lib/response/api-response-ok';
import { Header } from '../header/header';
import { Badge } from '../ui/badge/badge';
import { Paginado } from '../ui/paginado/paginado';
import { CommonModule } from '@angular/common';
import { Loader } from '../ui/loader/loader';

@Component({
  selector: 'app-correosenviados',
  imports: [Header, LucideAngularModule, Badge, Paginado, CommonModule, Loader],
  templateUrl: './correosenviados.html',
  styleUrl: './correosenviados.scss',
  providers: [CorreosEnviados],
})
export class Correosenviados implements OnInit {
  private readonly correosEnviadosService = inject(CorreosEnviados);
  private readonly authService = inject(LoginService);
  private readonly tokenService = inject(TokenService);
  readonly Users = Users;
  readonly Mail = Mail;
  readonly Calendar = Calendar;
  readonly Download = Download;
  readonly Loader2 = Loader2;
  readonly Check = CheckCheck;
  readonly X = X;
  readonly routeAdmin = Rutas.ADMIN;
  loadingData = false;
  loadingVerification = true;
  apiFinished = false;

  reports: EnviosCorreosReportDto = {
    total: 0,
    hoy: 0,
    semana: 0,
    success_true: 0,
    success_false: 0,
  };

  emails: EmailCorreoResponseDto[] = [];

  page = 1;
  currentPage = 1;
  limit = 5;
  pagination!: Pagination;

  isFirst: boolean = false;
  isLast: boolean = false;
  totalPages!: number;
  totalElements!: number;

  isFirstPage: boolean = true;
  isLastPage: boolean = false;

  isLoading: boolean = false;

  //TODO: VER Q HACE ESTO
  headerOpen = false;

  ngOnInit(): void {
    this.onLoadingStarted();
  }

  onLoadingStarted() {
    this.authService.validateToken().subscribe({
      next: (res) => {
        if (res.valid) {
          this.apiFinished = res.valid;
          this.getReports();
          this.getEmails(this.page, this.limit);
        }
      },
      error: (err) => {
        console.log(err);
        this.apiFinished = true;
        this.tokenService.logOut();
      },
    });
  }

  onLoadingFinished() {
    this.loadingVerification = false;
  }

  onHeaderOpen(value: boolean) {
    this.headerOpen = value;
  }

  getReports() {
    this.correosEnviadosService.getNumbersReports().subscribe({
      next: (res: EnviosCorreosReportDto) => {
        this.reports = res;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getEmails(page: number, limit: number) {
    this.loadingData = true;
    this.correosEnviadosService
      .listAllEmailsEnviados(this.page, this.limit)
      .subscribe({
        next: ({
          data,
          meta,
        }: ApiResponse<EmailCorreoResponseDto[], Pagination>) => {
          this.emails = data;
          this.pagination = meta;
          this.isFirst = meta.firstPage;
          this.isLast = meta.lastPage;
          this.totalPages = meta.totalPages;
          this.totalElements = meta.totalItems;
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => (this.loadingData = false),
      });
  }

  // PAGINATION
  getCurrentPageSize(): number {
    return this.limit === this.totalElements ? this.totalElements : this.limit;
  }

  First() {
    if (!this.isFirst) {
      this.currentPage = 1;
      this.page = 1;
      this.updatePageStatus();
      this.getEmails(this.page, this.limit);
      this.loadingData = false;
    }
  }

  Last() {
    if (!this.isLast) {
      this.currentPage = this.totalPages;
      const totalPages = Math.ceil(this.totalElements / this.limit);
      this.page = totalPages;
      this.loadingData = false;
      this.getEmails(this.page, this.limit);
    }
  }

  rewind() {
    if (this.currentPage > 1 && !this.isFirst) {
      this.currentPage--;
      this.page--;
      this.updatePageStatus();
      this.getEmails(this.page, this.limit);
      this.loadingData = false;
    }
  }

  forward() {
    if (this.currentPage < this.totalPages && !this.isLast) {
      this.currentPage++;
      this.page++;
      this.updatePageStatus();
      this.getEmails(this.page, this.limit);
      this.loadingData = false;
    }
  }

  setPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.page = pageNumber;

      this.getEmails(this.page, this.limit);
    }
  }

  private updatePageStatus() {
    this.isFirstPage = this.currentPage === 1;
    this.isLastPage = this.currentPage === this.totalPages;
  }
}
