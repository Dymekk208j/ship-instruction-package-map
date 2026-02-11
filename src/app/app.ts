import { Component, signal, inject, HostListener, computed } from '@angular/core';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { SelectedPackagesComponent } from './components/selected-packages/selected-packages.component';
import { ControlsComponent } from './components/controls/controls.component';
import { PartsListComponent } from './components/parts-list/parts-list.component';
import { HistoryComponent } from './components/history/history.component';
import { StepPreviewComponent } from './components/step-preview/step-preview.component';
import { PartsService } from './services/parts.service';
import { StepMappingService } from './services/step-mapping.service';

@Component({
  selector: 'app-root',
  imports: [
    ProgressBarComponent,
    SelectedPackagesComponent,
    ControlsComponent,
    PartsListComponent,
    HistoryComponent,
    StepPreviewComponent,
  ],
  templateUrl: './app.html',
})
export class App {
  private readonly partsService = inject(PartsService);
  readonly stepMappingService = inject(StepMappingService);

  activeTab = signal<'parts' | 'history' | 'preview'>('parts');
  searchFilter = signal('');

  filteredParts = signal(this.partsService.getAllParts());

  selectedPartsList = computed(() => {
    const selectedPkgs = Array.from(this.stepMappingService.selectedPackages());
    return this.partsService.getAllParts().filter((part) => selectedPkgs.includes(part.pkg));
  });

  onSearchChange(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.searchFilter.set(filter);
    this.filteredParts.set(
      filter ? this.partsService.searchParts(filter) : this.partsService.getAllParts(),
    );
  }

  onPartClick(pkg: number): void {
    this.stepMappingService.togglePackage(pkg);
  }

  onNextStep(): void {
    this.stepMappingService.nextStep();
  }

  onPreviousStep(): void {
    this.stepMappingService.previousStep();
  }

  onClearCurrent(): void {
    this.stepMappingService.clearCurrent();
  }

  onDownload(): void {
    this.stepMappingService.downloadResults();
  }

  setActiveTab(tab: 'parts' | 'history' | 'preview'): void {
    this.activeTab.set(tab);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvents(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onNextStep();
    } else if (event.key === 'ArrowLeft') {
      this.onPreviousStep();
    } else if (event.key === 'Delete') {
      this.onClearCurrent();
    }
  }
}
