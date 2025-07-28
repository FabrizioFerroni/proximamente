import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Button } from '../button/button';
import {
  ArrowLeft,
  Copy,
  LucideAngularModule,
  QrCode,
  Shield,
  Smartphone,
  X,
} from 'lucide-angular';
import { LoginService } from '../../../services/login';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-two-factor-setup',
  imports: [CommonModule, Button, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './two-factor-setup.html',
  styleUrl: './two-factor-setup.scss',
})
export class TwoFactorSetup {
  @Input() qrImage: string = '';
  @Input() secretKey = '';
  @Input() twoFactorSetupStep = 1;
  @Input() qrConfig = false;

  @Output() close = new EventEmitter<void>();

  @ViewChildren('codeInput') setupInputRefs!: QueryList<ElementRef>;
  readonly ArrowLeft = ArrowLeft;
  readonly QrCode = QrCode;
  readonly Smartphone = Smartphone;
  readonly Copy = Copy;
  readonly X = X;
  readonly Shield = Shield;
  form: FormGroup;
  isLoading = false;
  twoFactorError = false;
  twoFactorErrorMessage = '';
  private readonly loginService = inject(LoginService);

  @ViewChildren('inputEl') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tokenDigits: this.fb.array(
        Array(6)
          .fill('')
          .map(() => this.fb.control('', [Validators.required]))
      ),
    });
  }

  setTwoFactorSetupStep(step: number) {
    this.tokenDigits.reset();
    if (this.qrConfig) {
      return;
    }
    this.twoFactorSetupStep = step;
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

    this.loginService.active2fa(this.token).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.close.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.twoFactorError = true;
        this.twoFactorErrorMessage = err.message;

        setTimeout(() => {
          this.twoFactorError = false;
        }, 5000);
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
