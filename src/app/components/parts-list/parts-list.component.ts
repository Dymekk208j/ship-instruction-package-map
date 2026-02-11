import { Component, input, output } from '@angular/core';
import { PartItemComponent } from '../part-item/part-item.component';
import type { Part } from '../../models/part.model';

@Component({
  selector: 'app-parts-list',
  imports: [PartItemComponent],
  templateUrl: './parts-list.component.html',
})
export class PartsListComponent {
  parts = input.required<Part[]>();
  selectedPackages = input.required<Set<number>>();
  partClick = output<number>();
}
