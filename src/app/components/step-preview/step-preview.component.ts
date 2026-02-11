import { Component, input, signal, computed, inject, effect } from '@angular/core';
import { PartItemComponent } from '../part-item/part-item.component';
import { PartsService } from '../../services/parts.service';

interface StepMappingEntry {
  step: number;
  packages: number[];
}

@Component({
  selector: 'app-step-preview',
  imports: [PartItemComponent],
  templateUrl: './step-preview.component.html',
})
export class StepPreviewComponent {
  mappedSteps = input.required<StepMappingEntry[]>();
  private readonly partsService = inject(PartsService);

  selectedStep = signal<number | null>(null);

  constructor() {
    effect(() => {
      const steps = this.availableSteps();
      if (steps.length > 0 && this.selectedStep() === null) {
        this.selectedStep.set(steps[0]);
      }
    });
  }

  availableSteps = computed(() => {
    return this.mappedSteps()
      .map((entry) => entry.step)
      .sort((a, b) => a - b);
  });

  selectedStepParts = computed(() => {
    const step = this.selectedStep();
    if (step === null) return [];

    const entry = this.mappedSteps().find((e) => e.step === step);
    if (!entry) return [];

    return this.partsService.getAllParts().filter((part) => entry.packages.includes(part.pkg));
  });

  selectedStepPackages = computed(() => {
    const step = this.selectedStep();
    if (step === null) return new Set<number>();

    const entry = this.mappedSteps().find((e) => e.step === step);
    return new Set(entry?.packages || []);
  });

  currentStepIndex = computed(() => {
    const step = this.selectedStep();
    if (step === null) return -1;
    return this.availableSteps().indexOf(step);
  });

  hasPreviousStep = computed(() => this.currentStepIndex() > 0);

  hasNextStep = computed(() => {
    const index = this.currentStepIndex();
    return index >= 0 && index < this.availableSteps().length - 1;
  });

  previousStep(): void {
    if (this.hasPreviousStep()) {
      const index = this.currentStepIndex();
      this.selectedStep.set(this.availableSteps()[index - 1]);
    }
  }

  nextStep(): void {
    if (this.hasNextStep()) {
      const index = this.currentStepIndex();
      this.selectedStep.set(this.availableSteps()[index + 1]);
    }
  }

  goToStep(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const step = parseInt(value, 10);
    if (!isNaN(step) && this.availableSteps().includes(step)) {
      this.selectedStep.set(step);
    }
  }
}
