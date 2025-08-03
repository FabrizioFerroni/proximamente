import { Component, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Notifications } from '../../services/notifications';
import { ThemeService } from '../../services/theme';
import {
  AlertTriangle,
  Check,
  Home,
  LucideAngularModule,
  Mail,
  RefreshCcw,
  X,
} from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { Badge } from '../ui/badge/badge';
import { Button } from '../ui/button/button';
import { Enlace } from '../ui/enlace/enlace';
import { Rutas } from '../../lib/utils/rutas';
import { CryptoService } from '../../services/crypto';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-desubscribe',
  imports: [LucideAngularModule, CommonModule, Badge, Enlace, Button],
  templateUrl: './desubscribe.html',
  styleUrl: './desubscribe.scss',
})
export class Desubscribe {
  readonly Mail = Mail;
  readonly Check = Check;
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;
  readonly Home = Home;
  readonly RefreshCcw = RefreshCcw;
  private token = '';
  readonly routeHome = Rutas.HOME;
  isLoading = true;
  private readonly routerUrl = inject(ActivatedRoute);
  private readonly notificationService = inject(Notifications);
  private readonly cryptoService = inject(CryptoService);
  theme: 'light' | 'dark' | 'system' = 'system';
  private themeService = inject(ThemeService);
  progress = 0;
  private intervalId?: any;
  isSuccess = false;
  isError = false;
  isExpired = false;
  userEmail: string = '';
  data: { email: string; date: Date } = {
    email: '',
    date: new Date(),
  };
  errorMsg: string = '';

  async ngOnInit() {
    const currentTheme = this.themeService.getCurrentTheme();

    if (
      currentTheme === 'light' ||
      currentTheme === 'dark' ||
      currentTheme === 'system'
    ) {
      this.theme = currentTheme;
    } else {
      this.theme = 'system';
    }

    try {
      const { token } = await firstValueFrom(this.routerUrl.params);
      this.token = token;

      this.data = await this.cryptoService.validateTokenDes(token);

      this.userEmail = this.data.email;

      this.desubscribe();
    } catch (error: any) {
      this.errorMsg = error.message;
      this.completeProgress();
      setTimeout(() => {
        this.isLoading = false;
        this.isSuccess = false;
        this.isExpired = false;
        this.isError = true;
        this.isLoading = false;
      }, 10000);
      console.error('Error:', error);
    }
    this.startSimulatedProgress();
  }

  desubscribe() {
    this.notificationService.desubscribe(this.token).subscribe({
      next: (res) => {
        this.completeProgress();
        setTimeout(() => {
          this.isLoading = false;
          this.isSuccess = true;
          this.isError = false;
          this.isExpired = false;
        }, 10000);
      },
      error: (err) => {
        this.completeProgress();
        if (err.message === 'Token inválido o ya se ha desactivado.') {
          setTimeout(() => {
            this.isLoading = false;
            this.isSuccess = false;
            this.isError = false;
            this.isExpired = true;
          }, 10000);
        } else {
          setTimeout(() => {
            this.isLoading = false;
            this.isSuccess = false;
            this.isExpired = false;
            this.isError = true;
          }, 10000);
        }

        console.log(err);
      },
    });
  }

  private startSimulatedProgress(): void {
    this.intervalId = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 1;
      }
    }, 50);
  }

  private completeProgress(): void {
    clearInterval(this.intervalId);

    if (this.progress < 90) {
      this.progress = 90;
    }

    const end = setInterval(() => {
      if (this.progress >= 100) {
        clearInterval(end);
      } else {
        this.progress = Math.min(this.progress + 2, 100);
      }
    }, 30);
  }

  tryAgain() {
    // window reload
    window.location.reload();
  }
}
