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
    // Dane będą załadowane przez APP_INITIALIZER
  }

  async init(): Promise<void> {
    const [mapping, currentStep, selectedPackages, lastSaved] = await Promise.all([
      this.db.getStepMappingAsync(),
      this.db.getCurrentStepAsync(),
      this.db.getSelectedPackagesAsync(),
      this.db.getLastSavedAsync(),
    ]);

    this.stepMapping.set(mapping);
    this.currentStep.set(currentStep);
    this.selectedPackages.set(new Set(selectedPackages));

    if (lastSaved) {
      console.log('✅ Załadowano dane z Supabase:', lastSaved);
    }
  }

  async togglePackage(pkg: number): Promise<void> {
    const current = new Set(this.selectedPackages());
    if (current.has(pkg)) {
      current.delete(pkg);
    } else {
      current.add(pkg);
    }
    this.selectedPackages.set(current);
    await this.saveProgress();
  }

  async nextStep(): Promise<void> {
    if (this.selectedPackages().size > 0) {
      const mapping = { ...this.stepMapping() };
      const packages = Array.from(this.selectedPackages()).sort((a, b) => a - b);
      mapping[this.currentStep()] = packages;
      this.stepMapping.set(mapping);

      // Zapisz do bazy
      await this.db.setStepMapping(this.currentStep(), packages);
      await this.saveProgress();
    }

    const next = this.currentStep() + 1;
    if (next <= this.TOTAL_STEPS) {
      this.currentStep.set(next);
      await this.saveProgress();
    }

    this.selectedPackages.set(new Set());
    await this.db.clearSelectedPackages();
  }

  async previousStep(): Promise<void> {
    const prev = this.currentStep() - 1;
    if (prev >= 1) {
      this.currentStep.set(prev);
      await this.saveProgress();

      // Load previous selections if they exist
      const mapping = this.stepMapping();
      if (mapping[prev]) {
        this.selectedPackages.set(new Set(mapping[prev]));
      } else {
        this.selectedPackages.set(new Set());
      }
    }
  }

  async clearCurrent(): Promise<void> {
    this.selectedPackages.set(new Set());
    await this.db.clearSelectedPackages();
    await this.saveProgress();
  }

  async downloadResults(): Promise<void> {
    // Eksport bazy danych
    await this.db.exportDatabase();
  }

  private async saveProgress(): Promise<void> {
    await this.db.setCurrentStep(this.currentStep());
    await this.db.setSelectedPackages(Array.from(this.selectedPackages()));
  }
}
