import { Component } from '@angular/core';
import { Github, Linkedin, LucideAngularModule, Mail } from 'lucide-angular';
import { Badge } from '../ui/badge/badge';

@Component({
  selector: 'app-bioredes',
  imports: [Badge, LucideAngularModule],
  templateUrl: './bioredes.html',
  styleUrl: './bioredes.scss',
})
export class Bioredes {
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
}
