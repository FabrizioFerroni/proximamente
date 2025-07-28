import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private html = document.documentElement;

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const theme = localStorage.getItem('hs_theme') || 'system';

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const isLightOrAuto =
      theme === 'light' || (theme === 'system' && !prefersDark);
    const isDarkOrAuto =
      theme === 'dark' || (theme === 'system' && prefersDark);

    if (isLightOrAuto && this.html.classList.contains('dark')) {
      this.html.classList.remove('dark');
    } else if (isDarkOrAuto && !this.html.classList.contains('dark')) {
      this.html.classList.add('dark');
    }
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    localStorage.setItem('hs_theme', theme);
    this.initTheme(); // Reaplica la lógica
  }

  getCurrentTheme(): string {
    return localStorage.getItem('hs_theme') || 'system';
  }
}
