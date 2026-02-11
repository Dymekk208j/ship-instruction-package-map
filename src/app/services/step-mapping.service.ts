import { Injectable, signal, computed, inject } from '@angular/core';
import type { StepMapping } from '../models/part.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class StepMappingService {
  private readonly TOTAL_STEPS = 2487;
  private readonly db = inject(DatabaseService);

  currentStep = signal<number>(1);
  selectedPackages = signal<Set<number>>(new Set());
  stepMapping = signal<StepMapping>({});

  completedSteps = computed(() => Object.keys(this.stepMapping()).length);
  progress = computed(() => (this.completedSteps() / this.TOTAL_STEPS) * 100);
  progressText = computed(() => `${this.completedSteps()}/${this.TOTAL_STEPS}`);

  selectedPackagesText = computed(() => {
    const packages = Array.from(this.selectedPackages()).sort((a, b) => a - b);
    return packages.length === 0 ? 'Brak wybranych pakietów' : `Pakiet ${packages.join(', ')}`;
  });

  mappedSteps = computed(() => {
    return Object.entries(this.stepMapping())
      .map(([step, packages]) => ({ step: parseInt(step), packages }))
      .sort((a, b) => a.step - b.step);
  });

  constructor() {
    this.loadProgress();
  }

  togglePackage(pkg: number): void {
    const current = new Set(this.selectedPackages());
    if (current.has(pkg)) {
      current.delete(pkg);
    } else {
      current.add(pkg);
    }
    this.selectedPackages.set(current);
    this.saveProgress();
  }

  nextStep(): void {
    if (this.selectedPackages().size > 0) {
      const mapping = { ...this.stepMapping() };
      const packages = Array.from(this.selectedPackages()).sort((a, b) => a - b);
      mapping[this.currentStep()] = packages;
      this.stepMapping.set(mapping);

      // Zapisz do bazy
      this.db.setStepMapping(this.currentStep(), packages);
      this.saveProgress();
    }

    const next = this.currentStep() + 1;
    if (next <= this.TOTAL_STEPS) {
      this.currentStep.set(next);
      this.saveProgress();
    }

    this.selectedPackages.set(new Set());
    this.db.clearSelectedPackages();
  }

  previousStep(): void {
    const prev = this.currentStep() - 1;
    if (prev >= 1) {
      this.currentStep.set(prev);
      this.saveProgress();

      // Load previous selections if they exist
      const mapping = this.stepMapping();
      if (mapping[prev]) {
        this.selectedPackages.set(new Set(mapping[prev]));
      } else {
        this.selectedPackages.set(new Set());
      }
    }
  }

  clearCurrent(): void {
    this.selectedPackages.set(new Set());
    this.db.clearSelectedPackages();
    this.saveProgress();
  }

  downloadResults(): void {
    // Eksport bazy danych SQLite
    this.db.exportDatabase();
  }

  private saveProgress(): void {
    this.db.setCurrentStep(this.currentStep());
    this.db.setSelectedPackages(Array.from(this.selectedPackages()));
  }

  private loadProgress(): void {
    // Baza jest już zainicjalizowana przez APP_INITIALIZER
    this.stepMapping.set(this.db.getStepMapping());
    this.currentStep.set(this.db.getCurrentStep());
    this.selectedPackages.set(new Set(this.db.getSelectedPackages()));

    const lastSaved = this.db.getLastSaved();
    if (lastSaved) {
      console.log('✅ Załadowano dane z bazy SQLite:', lastSaved);
    }
  }
}
