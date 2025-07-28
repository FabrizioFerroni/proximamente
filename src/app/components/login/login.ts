import { Component, inject } from '@angular/core';
import { Header } from '../header/header';
import {
  LucideAngularModule,
  User,
  Lock,
  EyeOff,
  Eye,
  Loader2,
  LogIn,
} from 'lucide-angular';
import { Button } from '../ui/button/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StrongPasswordRegx } from '../../lib/utils/passwordLength';
import { CommonModule } from '@angular/common';
import { LoginDto, LoginResponse } from '../../dtos/login';
import { LoginService } from '../../services/login';
import { TokenService } from '../../services/token';
import { RefreshToken } from '../../lib/interfaces/refresh-token';
import { UserProfile } from '../../lib/interfaces/user-profile';
import { Router } from '@angular/router';
import { Rutas } from '../../lib/utils/rutas';

@Component({
  selector: 'app-login',
  imports: [
    Header,
    LucideAngularModule,
    Button,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly User = User;
  readonly Password = Lock;
  readonly EyeOff = EyeOff;
  readonly Eye = Eye;
  readonly Loader2 = Loader2;
  readonly LogIn = LogIn;
  private readonly router = inject(Router);
  private loginService = inject(LoginService);
  private tokenService = inject(TokenService);

  form: FormGroup;
  showPassword = false;
  isLoading = false;
  isSubmitted = false;
  rememberSelect = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(StrongPasswordRegx),
        ],
      ],
      remember: [false],
    });
  }

  remember() {
    this.rememberSelect = this.rememberField!.value ? true : false;
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }

  get rememberField() {
    return this.form.get('remember');
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.password?.invalid) {
      this.password.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credenciales = this.form.value as LoginDto;
    this.loginService.login(credenciales).subscribe({
      next: (res: LoginResponse) => {
        this.isLoading = false;

        if (res.twoFactorEnabled) {
          this.tokenService.setLoginSecret(res.loginSecret!);
          this.tokenService.setRemember(this.rememberSelect);
          this.router.navigate([`/${Rutas.LOGIN2FA}`]);
          return;
        }

        //guardar token
        const user: UserProfile = {
          id: res.id!,
          name: res.name!,
          lastname: res.lastname!,
          username: res.username!,
          is_2fa_enabled: res.is_2fa_enabled!,
          twofa_temp_secret: res.twofa_temp_secret!,
        };

        const bodyRT: RefreshToken = {
          oldToken: res.refreshToken!,
        };

        if (this.rememberSelect) {
          this.tokenService.setUserLS(user);
          this.tokenService.setLocalStorage(res.token!);
        } else {
          this.tokenService.setUserSS(user);
          this.tokenService.setSessionStorage(res.token!);
        }

        /*     this.tokenService.setUserLS(user);
        this.tokenService.setLocalStorage(res.token!); */
        this.tokenService.setCookieRefresh(bodyRT);
        this.router.navigate([`/${Rutas.ADMIN}`]);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
