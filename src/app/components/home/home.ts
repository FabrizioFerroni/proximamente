import { Component } from '@angular/core';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { Bioredes } from '../bioredes/bioredes';
import { Hero } from '../hero/hero';

@Component({
  selector: 'app-home',
  imports: [Footer, Header, Bioredes, Hero],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
