import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LucideAngularModule, Shield } from 'lucide-angular';
import { ThemeService } from '../../../services/theme';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-loader',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements OnInit, OnChanges {
  readonly Shield = Shield;
  @Input() completed = false;
  @Output() finished = new EventEmitter<void>();
  progress = 0;

  theme: 'light' | 'dark' | 'system' = 'system';
  private themeService = inject(ThemeService);

  private intervalId?: any;
  private completeTriggered = false;

  ngOnInit(): void {
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

    this.startSimulatedProgress();
  }

  ngDoCheck(): void {
    if (this.completed && !this.completeTriggered) {
      this.completeTriggered = true;
      this.forceCompleteProgress();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['complete']?.currentValue === true) {
      this.forceCompleteProgress();
    }
  }

  simulateProgress(): void {
    this.intervalId = setInterval(() => {
      if (this.progress < 90) this.progress += 1;
    }, 50);
  }

  completeProgress(): void {
    clearInterval(this.intervalId);
    const end = setInterval(() => {
      if (this.progress >= 100) {
        clearInterval(end);
      } else {
        this.progress += 2;
      }
    }, 30);
  }

  private startSimulatedProgress(): void {
    this.intervalId = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 1;
      }
    }, 50);
  }

  private forceCompleteProgress(): void {
    clearInterval(this.intervalId);

    if (this.progress < 90) {
      this.progress = 90;
    }

    const end = setInterval(() => {
      console.log('progreso actual:', this.progress);
      if (this.progress >= 100) {
        clearInterval(end);
        this.finished.emit();
      } else {
        this.progress = Math.min(this.progress + 2, 100);
      }
    }, 30);
  }
}
