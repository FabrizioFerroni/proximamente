import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme';
import { Rutas } from '../../../lib/utils/rutas';
import {
  AlertTriangle,
  ArrowLeft,
  Github,
  Home,
  Linkedin,
  LucideAngularModule,
  Mail,
  Search,
} from 'lucide-angular';
import { Enlace } from '../enlace/enlace';
import { Button } from '../button/button';

@Component({
  selector: 'app-notfound',
  imports: [LucideAngularModule, Enlace, Button],
  templateUrl: './notfound.html',
  styleUrl: './notfound.scss',
})
export class Notfound implements OnInit {
  readonly AlertTriangle = AlertTriangle;
  readonly Search = Search;
  readonly Home = Home;
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
  readonly ArrowLeft = ArrowLeft;
  theme: 'light' | 'dark' | 'system' = 'system';
  private themeService = inject(ThemeService);
  readonly routeHome = Rutas.HOME;
  year: number = new Date().getFullYear();
  ngOnInit() {
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

  goBack(): void {
    window.history.back();
  }
}
