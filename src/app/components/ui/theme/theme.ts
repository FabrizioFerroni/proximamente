import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme';
import {
  LucideAngularModule,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-angular';
import { Button } from '../button/button';

@Component({
  selector: 'app-theme',
  imports: [LucideAngularModule, Button],
  templateUrl: './theme.html',
  styleUrl: './theme.scss',
})
export class Theme {
  readonly MoonIcon = MoonIcon;
  readonly SunIcon = SunIcon;
  readonly MonitorIcon = MonitorIcon;
  theme: 'light' | 'dark' | 'system' = 'system';
  private themeService = inject(ThemeService);

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
  }

  toggleTheme(): void {
    const nextTheme = this.getNextTheme(this.theme);
    this.themeService.setTheme(nextTheme);
    this.theme = nextTheme;
  }

  getNextTheme(
    current: 'light' | 'dark' | 'system'
  ): 'light' | 'dark' | 'system' {
    if (current === 'light') return 'dark';
    if (current === 'dark') return 'system';
    return 'light';
  }

  getIconForTheme(theme: 'light' | 'dark' | 'system'): any {
    switch (theme) {
      case 'light':
        return this.MoonIcon;
      // return this.SunIcon;
      case 'dark':
        return this.MonitorIcon;
      // return this.MoonIcon;
      default:
        return this.SunIcon;
    }
  }

  getThemeToChange(theme: 'light' | 'dark' | 'system'): string {
    switch (theme) {
      case 'light':
        return 'Oscuro';
      case 'dark':
        return 'Sistema';
      default:
        return 'Claro';
    }
  }
}
