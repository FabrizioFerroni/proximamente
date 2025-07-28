import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../button/button';
import { ArrowLeft, ArrowRight, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-paginado',
  imports: [CommonModule, Button, LucideAngularModule],
  templateUrl: './paginado.html',
  styleUrl: './paginado.scss',
})
export class Paginado<T> {
  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;
  @Input() content: T[] = [];
  @Input() page: number = 0;
  @Input() size: number = 10;
  @Input() totalElements: number = 0;
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() pageTitle: string = '';
  @Input() isFirst: boolean = false;
  @Input() isLast: boolean = false;

  @Output() firstPage = new EventEmitter<void>();
  @Output() lastPage = new EventEmitter<void>();
  @Output() rewind = new EventEmitter<void>();
  @Output() forward = new EventEmitter<void>();
  @Output() setPage = new EventEmitter<number>();

  constructor() {}

  First() {
    if (!this.isFirst) {
      this.firstPage.emit();
    }
  }

  Last() {
    if (!this.isLast) {
      this.lastPage.emit();
    }
  }

  Rewind() {
    if (this.currentPage > 1 && !this.isFirst) {
      //TODO: Ver porque anule el negado de isFirst
      this.rewind.emit();
    }
  }

  Forward() {
    if (this.currentPage < this.totalPages && !this.isLast) {
      this.forward.emit();
    }
  }

  SetPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.setPage.emit(pageNumber);
    }
  }

  get totalPagesAll(): number {
    return Math.ceil(this.totalElements / this.size);
  }

  get startIndex(): number {
    return Math.min((this.currentPage - 1) * this.size + 1, this.totalElements);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.size, this.totalElements);
  }
}
