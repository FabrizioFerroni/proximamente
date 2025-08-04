import { Component, inject } from '@angular/core';
import { Header } from '../header/header';
import {
  Calendar,
  Download,
  Loader2,
  LucideAngularModule,
  Mail,
  Users,
} from 'lucide-angular';
import { Notifications } from '../../services/notifications';
import {
  NotificationReportDto,
  NotifyResponseDto,
} from '../../dtos/notify.dto';
import { Button } from '../ui/button/button';
import { Badge } from '../ui/badge/badge';
import { Pagination } from '../../lib/interfaces/pagination';
import { Paginado } from '../ui/paginado/paginado';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../lib/response/api-response-ok';
import { Loader } from '../ui/loader/loader';
import { LoginService } from '../../services/login';
import { TokenService } from '../../services/token';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  imports: [
    Header,
    LucideAngularModule,
    Button,
    Badge,
    Paginado,
    CommonModule,
    Loader,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  readonly Users = Users;
  readonly Mail = Mail;
  readonly Calendar = Calendar;
  readonly Download = Download;
  readonly Loader2 = Loader2;
  loadingData = false;
  loadingVerification = true;
  apiFinished = false;
  private readonly notificationService = inject(Notifications);
  private readonly authService = inject(LoginService);
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  headerOpen = false;

  reports: NotificationReportDto = {
    total: 0,
    hoy: 0,
    semana: 0,
  };

  notifications: NotifyResponseDto[] = [];

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

  isLoadingWorkflow: boolean = false;
  isLoadingExport: boolean = false;

  ngOnInit() {
    this.onLoadingStarted();
  }

  onLoadingStarted() {
    this.authService.validateToken().subscribe({
      next: (res) => {
        if (res.valid) {
          this.apiFinished = res.valid;
          this.getReports();
          this.getNotifications(this.page, this.limit);
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
    this.notificationService.getNumbersReports().subscribe({
      next: (res: NotificationReportDto) => {
        this.reports = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getNotifications(page: number, limit: number) {
    this.loadingData = true;
    this.notificationService.getNotifications(this.page, this.limit).subscribe({
      next: ({ data, meta }: ApiResponse<NotifyResponseDto[], Pagination>) => {
        this.notifications = data;
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

  notifyMail() {
    this.isLoadingWorkflow = true;
    this.notificationService.notifyMail().subscribe({
      next: (res) => {
        this.isLoadingWorkflow = false;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  exportToExcel() {
    this.isLoadingExport = true;
    this.notificationService.exportNotifications().subscribe((data) => {
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'notifications.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      this.isLoadingExport = false;
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
      this.getNotifications(this.page, this.limit);
      this.loadingData = false;
    }
  }

  Last() {
    if (!this.isLast) {
      this.currentPage = this.totalPages;
      const totalPages = Math.ceil(this.totalElements / this.limit);
      this.page = totalPages;
      this.loadingData = false;
      this.getNotifications(this.page, this.limit);
    }
  }

  rewind() {
    if (this.currentPage > 1 && !this.isFirst) {
      this.currentPage--;
      this.page--;
      this.updatePageStatus();
      this.getNotifications(this.page, this.limit);
      this.loadingData = false;
    }
  }

  forward() {
    if (this.currentPage < this.totalPages && !this.isLast) {
      this.currentPage++;
      this.page++;
      this.updatePageStatus();
      this.getNotifications(this.page, this.limit);
      this.loadingData = false;
    }
  }

  setPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.page = pageNumber;

      this.getNotifications(this.page, this.limit);
    }
  }

  private updatePageStatus() {
    this.isFirstPage = this.currentPage === 1;
    this.isLastPage = this.currentPage === this.totalPages;
  }
}
