import {
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Header } from '../header/header';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  CheckCheck,
  CheckLine,
  Loader2,
  LogIn,
  LucideAngularModule,
  Shield,
} from 'lucide-angular';
import { Button } from '../ui/button/button';
import { Enlace } from '../ui/enlace/enlace';
import { NavigationService } from '../../services/navigation';
import { TokenService } from '../../services/token';
import { Router } from '@angular/router';
import { Login2FaDto, LoginResponse } from '../../dtos/login';
import { LoginService } from '../../services/login';
import { Rutas } from '../../lib/utils/rutas';
import { RefreshToken } from '../../lib/interfaces/refresh-token';
import { UserProfile } from '../../lib/interfaces/user-profile';

@Component({
  selector: 'app-twofactor',
  imports: [
    Header,
    ReactiveFormsModule,
    CommonModule,
    LucideAngularModule,
    Button,
    Enlace,
  ],
  templateUrl: './twofactor.html',
  styleUrl: './twofactor.scss',
})
export class Twofactor {
  readonly Shield = Shield;
  readonly Loader2 = Loader2;
  readonly CheckCheck = CheckCheck;
  form: FormGroup;
  isLoading = false;
  private navService = inject(NavigationService);
  private loginService = inject(LoginService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  loginSecret: string | null = null;
  currentRoute: string | null = null;
  previusRoute: string | null = null;

  //chatgpt response:
  twoFactorError = false;
  @ViewChildren('inputEl') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  constructor(private fb: FormBuilder) {
    this.loginSecret = this.tokenService.getLoginSecret();

    if (this.loginSecret === null) {
      this.router.navigate([`/${Rutas.LOGIN}`]);
    }

    this.previusRoute = this.navService.getPreviousUrl() ?? '/';
    this.form = this.fb.group({
      tokenDigits: this.fb.array(
        Array(6)
          .fill('')
          .map(() => this.fb.control('', [Validators.required]))
      ),
    });
  }

  get tokenDigits(): FormArray {
    return this.form.get('tokenDigits') as FormArray;
  }

  get token(): string {
    return this.tokenDigits.controls.map((c) => c.value).join('');
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.tokenDigits.invalid) {
      this.tokenDigits.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data: Login2FaDto = {
      loginSecret: this.loginSecret!,
      token: this.token,
    };

    this.loginService.login2Fa(data).subscribe({
      next: (res: LoginResponse) => {
        this.isLoading = false;
        this.tokenService.deleteLoginSecret();

        const bodyRT: RefreshToken = {
          oldToken: res.refreshToken!,
        };

        const user: UserProfile = {
          id: res.id!,
          name: res.name!,
          lastname: res.lastname!,
          username: res.username!,
          is_2fa_enabled: res.is_2fa_enabled!,
          twofa_temp_secret: res.twofa_temp_secret!,
        };

        const rememberSelectRaw = this.tokenService.getRemember();
        const rememberSelect: boolean =
          rememberSelectRaw === true || rememberSelectRaw === 'true';

        if (rememberSelect) {
          this.tokenService.setUserLS(user);
          this.tokenService.setLocalStorage(res.token!);
        } else {
          this.tokenService.setUserSS(user);
          this.tokenService.setSessionStorage(res.token!);
        }

        this.tokenService.deleteRemember();

        this.tokenService.setCookieRefresh(bodyRT!);
        this.router.navigate([`/${Rutas.ADMIN}`]);
      },
      error: () => {
        this.isLoading = false;
        this.twoFactorError = true;
      },
    });
  }

  onInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length > 1) {
      input.value = value.charAt(0);
    }

    if (value && index < this.inputRefs.length - 1) {
      this.inputRefs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'Backspace' && !this.tokenDigits.at(index).value) {
      if (index > 0) {
        this.inputRefs.toArray()[index - 1].nativeElement.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const data = event.clipboardData?.getData('text') ?? '';
    const digits = data.replace(/\D/g, '').slice(0, 6).split('');

    digits.forEach((digit, i) => {
      if (i < this.tokenDigits.length) {
        this.tokenDigits.at(i).setValue(digit);
      }
    });

    // Auto foco al último ingresado
    setTimeout(() => {
      const last = digits.length - 1;
      if (this.inputRefs.toArray()[last]) {
        this.inputRefs.toArray()[last].nativeElement.focus();
      }
    }, 0);
  }

  isDisabled(index: number): boolean {
    if (index === 0) return false; // el primero siempre habilitado
    return !this.tokenDigits.at(index - 1).value; // si el anterior está vacío => deshabilitado
  }
}
