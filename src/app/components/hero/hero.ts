import { Component } from '@angular/core';
import { Email } from '../email/email';
import { Badge } from '../ui/badge/badge';
import { LucideAngularModule, SparklesIcon } from 'lucide-angular';

@Component({
  selector: 'app-hero',
  imports: [Email, Badge, LucideAngularModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  readonly SparklesIcon = SparklesIcon;
}
