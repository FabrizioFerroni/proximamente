import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        pairwise() // Nos da [anterior, actual]
      )
      .subscribe(([prev, curr]: [NavigationEnd, NavigationEnd]) => {
        this.previousUrl = prev.urlAfterRedirects;
        this.currentUrl = curr.urlAfterRedirects;
      });
  }

  getPreviousUrl(): string | null {
    return this.previousUrl;
  }

  getCurrentUrl(): string | null {
    return this.currentUrl;
  }
}
