import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.component.html',
})
export class ControlsComponent {
  currentStep = input.required<number>();
  nextStep = output<void>();
  previousStep = output<void>();
  download = output<void>();
  clearCurrent = output<void>();
}
