import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  LucideAngularModule,
  ArrowLeft,
  User,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  Mail,
} from 'lucide-angular';
import { Button } from '../ui/button/button';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation';
import { Enlace } from '../ui/enlace/enlace';
import { Rutas } from '../../lib/utils/rutas';
import { TokenService } from '../../services/token';
import { UserProfile } from '../../lib/interfaces/user-profile';
import { TokenInfo } from '../../lib/interfaces/token-info';
import { Storage } from '../../lib/utils/storage';
import { Dropdown } from '../ui/dropdown/dropdown';
import { Theme } from '../ui/theme/theme';
import { jwtDecode, JwtPayload } from 'jwt-decode';
@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, CommonModule, Button, Enlace, Dropdown, Theme],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  providers: [NavigationService],
})
export class Header {
  readonly ArrowLeft = ArrowLeft;
  readonly User = User;
  readonly Mail = Mail;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly profileRoute = Rutas.PROFILE;
  readonly emailsRoute = Rutas.CORREOSENVIADOS;
  private tokenService = inject(TokenService);
  private navService = inject(NavigationService);
  @Output() isOpen = new EventEmitter<boolean>(false);
  open = false;
  currentRoute: string | null = null;
  previusRoute: string | null = null;
  adminRoute: string | null = Rutas.ADMIN;

  isHome = false;
  isAdminAndProfile = false;
  isProfile = false;

  @Input() user?: UserProfile = {
    id: '',
    name: '',
    lastname: '',
    username: '',
    is_2fa_enabled: false,
    twofa_temp_secret: null,
  };

  ngOnInit(): void {
    if (this.user?.username == '') {
      this.getUserProfile();
    }

    this.previusRoute = this.navService.getPreviousUrl() ?? '/';

    if (this.navService.getCurrentUrl() === '/') {
      this.isHome = true;
    } else if (this.navService.getCurrentUrl() === `/${Rutas.ADMIN}`) {
      this.isAdminAndProfile = true;
    } else if (this.navService.getCurrentUrl() === `/${Rutas.PROFILE}`) {
      this.isAdminAndProfile = true;
      this.isProfile = true;
    } else if (
      this.navService.getCurrentUrl() === `/${Rutas.CORREOSENVIADOS}`
    ) {
      this.isAdminAndProfile = true;
      this.isProfile = true;
    }
  }

  getUserProfile(): void {
    const { source }: TokenInfo = this.tokenService.getTokenLogin();

    if (source === Storage.SESSION_STORAGE) {
      const user = this.tokenService.getUserSS();
      this.user = user!;
    } else if (source === Storage.LOCAL_STORAGE) {
      const user = this.tokenService.getUserLS();

      this.user = user!;
    }
  }

  get routeBack(): string {
    return this.isProfile
      ? (this.previusRoute = `${Rutas.ADMIN}`)
      : this.previusRoute!;
  }

  toggleDropdown() {
    this.open = !this.open;
    this.isOpen.emit(this.open);
  }

  handleLogout() {
    const { token, source }: TokenInfo = this.tokenService.getTokenLogin();

    let currentJti: string | null = null;
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        currentJti = decoded.jti || null;
      } catch (err) {
        console.error('Error al decodificar el token:', err);
      }
    }

    this.tokenService.logOut(currentJti!);

    if (source === Storage.SESSION_STORAGE) {
      this.tokenService.deleteUserSS();
    } else if (source === Storage.LOCAL_STORAGE) {
      this.tokenService.deleteUserLS();
    }
  }
}
