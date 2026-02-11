import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.component.html',
})
export class ProgressBarComponent {
  progress = input.required<number>();
  text = input.required<string>();
}
