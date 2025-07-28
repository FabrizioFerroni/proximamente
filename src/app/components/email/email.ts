import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from '../ui/button/button';
import { CommonModule } from '@angular/common';
import { Check, Loader2, LucideAngularModule, Send, X } from 'lucide-angular';
import {
  CNotificationResponse,
  CreateNotificationDto,
} from '../../dtos/notify.dto';
import { Notifications } from '../../services/notifications';

@Component({
  selector: 'app-email',
  imports: [Button, CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './email.html',
  styleUrl: './email.scss',
})
export class Email {
  readonly Check = Check;
  readonly X = X;
  readonly Loader2 = Loader2;
  readonly Send = Send;
  private readonly notificationService = inject(Notifications);
  form: FormGroup;
  isLoading = false;
  isSubmitted = false;
  isSuccess = false;
  isError = false;
  message: string = '';
  nameN: string = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;

    const credenciales = this.form.value as CreateNotificationDto;

    this.notificationService.createNotification(credenciales).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.nameN = credenciales.name;
        this.form.reset();

        setTimeout(() => {
          this.isSubmitted = false;
          this.isError = false;
        }, 5000);
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.isSuccess = false;
        this.message = err.message;
        setTimeout(() => {
          this.isSuccess = false;
          this.isError = false;
          this.message = '';
        }, 5000);
      },
    });
  }
}
