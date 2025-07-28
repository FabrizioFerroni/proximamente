import { Component, inject, Input } from '@angular/core';
import { cn } from '../../../lib/utils/cn';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enlace',
  imports: [RouterLink, CommonModule],
  templateUrl: './enlace.html',
  styleUrl: './enlace.scss',
})
export class Enlace {
  sanitizer = inject(DomSanitizer);
  @Input() variant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() target: '_self' | '_blank' | '_parent' | '_top' = '_blank';
  @Input() rel: string | null = null;
  @Input() href: string | null = null;
  @Input() disabled: boolean = false;
  @Input() className: string | null = null;

  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

    const variants: Record<string, string> = {
      default:
        'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90',
      destructive:
        'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90',
      outline:
        'border border-input bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
      secondary:
        'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80',
      ghost:
        'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
      link: 'text-[hsl(var(--primary))] underline-offset-4 hover:underline',
    };

    const sizes: Record<string, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return cn(base, variants[this.variant], sizes[this.size], this.className);
  }

  get isExternal(): boolean {
    return this.target === '_blank' || !!this.href?.startsWith('http');
  }
}
