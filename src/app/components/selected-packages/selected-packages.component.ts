import { Component, input, output } from '@angular/core';
import { PartItemComponent } from '../part-item/part-item.component';
import type { Part } from '../../models/part.model';

@Component({
  selector: 'app-selected-packages',
  imports: [PartItemComponent],
  templateUrl: './selected-packages.component.html',
})
export class SelectedPackagesComponent {
  text = input.required<string>();
  parts = input.required<Part[]>();
  selectedPackages = input.required<Set<number>>();
  partClick = output<number>();
}
