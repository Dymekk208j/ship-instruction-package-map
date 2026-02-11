import { Component, input } from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  mappedSteps = input.required<{ step: number; packages: number[] }[]>();
}
