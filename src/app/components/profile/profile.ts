import { Component, inject, Renderer2 } from '@angular/core';
import { Header } from '../header/header';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login';
import { UserProfile } from '../../lib/interfaces/user-profile';
import {
  Lock,
  Loader2,
  LucideAngularModule,
  Save,
  User,
  Eye,
  EyeOff,
  Shield,
  Wifi,
  AlertTriangle,
  X,
  Smartphone,
  Tablet,
  Monitor,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-angular';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from '../ui/button/button';
import { Badge } from '../ui/badge/badge';
import { SessionsService } from '../../services/sessions';
import { SessionsResponse } from '../../dtos/sessions';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { TokenService } from '../../services/token';
import { Rutas } from '../../lib/utils/rutas';
import { TwoFactorSetup } from '../ui/two-factor-setup/two-factor-setup';
import { UserService } from '../../services/user-service';
import { UserInfoUpdateDto, UserUpdatePasswordDto } from '../../dtos/user';
import { TokenInfo } from '../../lib/interfaces/token-info';
import { Storage } from '../../lib/utils/storage';
import { StrongPasswordRegx } from '../../lib/utils/passwordLength';
import { Pagination } from '../../lib/interfaces/pagination';
import { ApiResponse } from '../../lib/response/api-response-ok';
import { Paginado } from '../ui/paginado/paginado';
import { Loader } from '../ui/loader/loader';

@Component({
  selector: 'app-profile',
  imports: [
    Header,
    LucideAngularModule,
    ReactiveFormsModule,
    CommonModule,
    Button,
    Badge,
    TwoFactorSetup,
    Paginado,
    Loader,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  readonly User = User;
  readonly Loader2 = Loader2;
  readonly Save = Save;
  readonly Lock = Lock;
  readonly EyeOff = EyeOff;
  readonly Eye = Eye;
  readonly Shield = Shield;
  readonly Wifi = Wifi;
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;
  readonly Check = Check;
  readonly Smartphone = Smartphone;
  readonly Tablet = Tablet;
  readonly Monitor = Monitor;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;

  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly sessionsService = inject(SessionsService);
  private readonly tokenService = inject(TokenService);
  private readonly userService = inject(UserService);

  form: FormGroup;
  form2: FormGroup;
  isLoading = false;
  isLoading3 = false;
  isLoading2 = false;
  isSubmitted = false;
  showPasswordActual = false;
  showNewPassword = false;
  showConfirmNewPassword = false;
  profileLoading = false;
  profileData = {
    id: '',
    twoFactorEnabled: false,
    twofa_temp_secret: null as string | null,
    qrConfig: false,
  };

  user: UserProfile = {
    id: '',
    name: '',
    lastname: '',
    username: '',
    is_2fa_enabled: false,
    twofa_temp_secret: null,
  };

  currentPage = 1;
  paso: number = 1;
  mostrarModal2FA = false;

  qrImage: string = '';
  secretKey = '';

  sessions: SessionsResponse[] | undefined = [];

  userInfoSuccess = false;
  userInfoError = false;
  userInfoMessage: string | string[] =
    'Hubo un error al actualizar la información. Por favor, inténtalo de nuevo.';

  passwordSuccess = false;
  passwordError = false;
  passwordMessage: string | string[] =
    'Hubo un error al actualizar la información. Por favor, inténtalo de nuevo.';

  page = 1;
  limit = 5;
  pagination!: Pagination;

  isFirst: boolean = false;
  isLast: boolean = false;
  totalPages!: number;
  totalElements!: number;

  isFirstPage: boolean = true;
  isLastPage: boolean = false;

  loadingVerification = true;
  apiFinished = false;

  constructor(private fb: FormBuilder, private renderer: Renderer2) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', [Validators.required]],
      username: [{ value: '', disabled: true }],
    });

    this.form2 = this.fb.group({
      passwordActual: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(StrongPasswordRegx),
        ],
      ],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(StrongPasswordRegx),
        ],
      ],
      confirmNewPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(StrongPasswordRegx),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.onLoadingStarted();
  }

  onLoadingStarted() {
    this.loginService.validateToken().subscribe({
      next: (res) => {
        if (res.valid) {
          this.apiFinished = res.valid;
          this.getProfile();
          this.getAllSessions(this.page, this.limit);
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

  get name() {
    return this.form.get('name');
  }

  get lastname() {
    return this.form.get('lastname');
  }

  get username() {
    return this.form.get('username');
  }

  get passwordActual() {
    return this.form2.get('passwordActual');
  }

  get newPassword() {
    return this.form2.get('newPassword');
  }

  get confirmNewPassword() {
    return this.form2.get('confirmNewPassword');
  }

  handleToggleTwoFactor(id: string, enable: boolean): void {
    if (enable) {
      this.loginService.desactive2fa(id!).subscribe({
        next: (res: string) => {
          this.getProfile();
          this.paso = 1;
          this.profileData.qrConfig = false;
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.mostrarModal2FA = true;
      this.renderer.addClass(document.body, 'overflow-hidden');
    }
  }

  getProfile() {
    this.loginService.getProfile().subscribe({
      next: (res: UserProfile) => {
        this.form.patchValue(res);
        this.profileData.id = res.id;
        this.profileData.twoFactorEnabled = res.is_2fa_enabled;
        this.profileData.twofa_temp_secret = res.twofa_temp_secret;

        if (
          this.profileData.twofa_temp_secret == null &&
          this.profileData.twoFactorEnabled == false
        ) {
          this.generar2fa();
        } else {
          this.profileData.qrConfig = true;
          this.paso = 2;
        }

        this.user = res;

        this.changeUserStorage(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getAllSessions(page: number, limit: number) {
    const { token } = this.tokenService.getTokenLogin();
    let currentJti: string | null = null;
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        currentJti = decoded.jti || null;
      } catch (err) {
        console.error('Error al decodificar el token:', err);
      }
    }

    this.isLoading3 = true;

    this.sessionsService.getAllSessions(page, limit).subscribe({
      next: ({ data, meta }: ApiResponse<SessionsResponse[], Pagination>) => {
        this.sessions =
          data
            .map((session: SessionsResponse) => ({
              ...session,
              isCurrent: session.jti === currentJti,
            }))
            .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)) || [];
        this.pagination = meta;
        this.isFirst = meta.firstPage;
        this.isLast = meta.lastPage;
        this.totalPages = meta.totalPages;
        this.totalElements = meta.totalItems;
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => (this.isLoading3 = false),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const credenciales = this.form.value as UserInfoUpdateDto;

    this.isLoading = true;

    this.userService
      .updateInfoUser(this.profileData.id, credenciales)
      .subscribe({
        next: (res: string) => {
          this.isLoading = false;
          this.getProfile();
          this.userInfoSuccess = true;
          this.userInfoError = false;
          this.userInfoMessage = res;

          setTimeout(() => {
            this.userInfoSuccess = false;
            this.userInfoError = false;
          }, 5000);
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err);
        },
      });
  }

  changeUserStorage(user: UserProfile) {
    const { source }: TokenInfo = this.tokenService.getTokenLogin();

    if (source === Storage.SESSION_STORAGE) {
      this.tokenService.deleteUserSS();
      this.tokenService.setUserSS(this.user);
    } else if (source === Storage.LOCAL_STORAGE) {
      this.tokenService.deleteUserLS();
      this.tokenService.setUserLS(this.user);
    }
  }

  onSubmitPassword(): void {
    if (this.form2.invalid) return;

    const credenciales = this.form2.value as UserUpdatePasswordDto;

    this.isLoading2 = true;

    this.userService
      .updatePasswordUser(this.profileData.id, credenciales)
      .subscribe({
        next: (res: string) => {
          this.isLoading2 = false;
          this.passwordSuccess = true;
          this.passwordError = false;
          this.passwordMessage = res;

          setTimeout(() => {
            this.passwordSuccess = false;
            this.passwordError = false;
            this.form2.reset();
          }, 5000);
        },
        error: (err) => {
          this.isLoading2 = false;
          this.passwordError = true;
          this.passwordSuccess = false;
          this.passwordMessage = err.message;

          console.log(err);

          setTimeout(() => {
            this.passwordSuccess = false;
            this.passwordError = false;
          }, 5000);
        },
      });
  }

  closeSession(jti: string) {
    this.sessionsService.logout(jti).subscribe({
      next: () => {
        this.getAllSessions(this.page, this.limit);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  closeAllSessions() {
    if (this.sessions?.length! > 1) {
      this.sessionsService.logoutAll().subscribe({
        next: () => {
          this.getAllSessions(this.page, this.limit);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  cerrarModal() {
    this.mostrarModal2FA = false;
    this.renderer.removeClass(document.body, 'overflow-hidden');
    this.getProfile();
    this.paso = 1;
  }

  generar2fa() {
    return this.loginService.generar2fa().subscribe({
      next: ({ qrCodeUrl, secret }: { qrCodeUrl: string; secret: string }) => {
        this.qrImage = qrCodeUrl;
        this.secretKey = secret;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  isPasswordStrong(value: string): boolean {
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*]/.test(value);
    const hasMinimumLength = value.length >= 8;

    return (
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter &&
      hasMinimumLength
    );
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
      this.getAllSessions(this.page, this.limit);
      this.isLoading3 = false;
    }
  }

  Last() {
    if (!this.isLast) {
      this.currentPage = this.totalPages;
      const totalPages = Math.ceil(this.totalElements / this.limit);
      this.page = totalPages;
      this.isLoading3 = false;
      this.getAllSessions(this.page, this.limit);
    }
  }

  rewind() {
    if (this.currentPage > 1 && !this.isFirst) {
      this.currentPage--;
      this.page--;
      this.updatePageStatus();
      this.getAllSessions(this.page, this.limit);
      this.isLoading3 = false;
    }
  }

  forward() {
    if (this.currentPage < this.totalPages && !this.isLast) {
      this.currentPage++;
      this.page++;
      this.updatePageStatus();
      this.getAllSessions(this.page, this.limit);
      this.isLoading3 = false;
    }
  }

  setPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.page = pageNumber;

      this.getAllSessions(this.page, this.limit);
    }
  }

  private updatePageStatus() {
    this.isFirstPage = this.currentPage === 1;
    this.isLastPage = this.currentPage === this.totalPages;
  }
}
