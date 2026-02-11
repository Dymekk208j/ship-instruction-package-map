import { Component, input, output, ElementRef } from '@angular/core';
import type { Part } from '../../models/part.model';

@Component({
  selector: 'app-part-item',
  imports: [],
  templateUrl: './part-item.component.html',
  styleUrl: './part-item.component.css',
})
export class PartItemComponent {
  part = input.required<Part>();
  isSelected = input.required<boolean>();
  useLargeImage = input<boolean>(false);
  partClick = output<number>();

  private previewElement: HTMLElement | null = null;

  getImageUrl(): string {
    if (this.useLargeImage()) {
      return './ISD_Monarch_elements_large/' + this.part().img;
    }
    return './ISD_Monarch_elements/' + this.part().img;
  }

  getLargeImageUrl(): string {
    // Używamy lokalnych dużych obrazków do preview
    return './ISD_Monarch_elements_large/' + this.part().img;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E?%3C/text%3E%3C/svg%3E";
  }

  onMouseEnter(event: MouseEvent): void {
    // Wyłącz preview jeśli używamy dużych obrazków
    if (this.useLargeImage()) return;

    // Utwórz element preview w body
    this.previewElement = document.createElement('div');
    this.previewElement.className = 'large-preview-container';
    this.previewElement.innerHTML = `
      <img src="${this.getLargeImageUrl()}" alt="${this.part().name}" />
    `;
    document.body.appendChild(this.previewElement);

    this.updatePreviewPosition(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.previewElement) {
      this.updatePreviewPosition(event);
    }
  }

  onMouseLeave(): void {
    // Usuń element preview
    if (this.previewElement) {
      document.body.removeChild(this.previewElement);
      this.previewElement = null;
    }
  }

  private updatePreviewPosition(event: MouseEvent): void {
    if (this.previewElement) {
      let x = event.clientX + 20;
      let y = event.clientY + 20;

      // Sprawdź czy podgląd wychodzi poza ekran i skoryguj pozycję
      if (x + 420 > window.innerWidth) {
        x = event.clientX - 420;
      }
      if (y + 420 > window.innerHeight) {
        y = event.clientY - 420;
      }

      this.previewElement.style.left = x + 'px';
      this.previewElement.style.top = y + 'px';
    }
  }
}
