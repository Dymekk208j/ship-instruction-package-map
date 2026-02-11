# LEGO ISD Monarch - Mapowanie Kroków

Aplikacja Angular do mapowania kroków instrukcji LEGO do numerów pakietów.

## Funkcje

- ✅ Mapowanie kroków (1-2487) do pakietów
- 🔍 Wyszukiwanie części po nazwie lub numerze
- 💾 Automatyczny zapis postępu (localStorage)
- ⬇️ Eksport wyników do pliku tekstowego
- ⌨️ Skróty klawiszowe:
  - **Enter** - Następny krok
  - **Strzałka w lewo** - Poprzedni krok
  - **Delete** - Wyczyść zaznaczenia

## Architektura

### Komponenty

- `HeaderComponent` - Nagłówek aplikacji
- `ProgressBarComponent` - Pasek postępu
- `SelectedPackagesComponent` - Wyświetlanie wybranych pakietów
- `ControlsComponent` - Przyciski sterowania i wyszukiwarka
- `PartItemComponent` - Pojedyncza część LEGO
- `PartsListComponent` - Lista wszystkich części
- `HistoryComponent` - Historia zmapowanych kroków

### Serwisy

- `PartsService` - Zarządzanie danymi części (292 elementy)
- `StepMappingService` - Zarządzanie stanem aplikacji z użyciem signals

### Technologie

- Angular + Standalone Components
- Tailwind CSS
- Signals dla reaktywnego zarządzania stanem
- TypeScript

## Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie dev serwera
npm start

# Budowanie produkcyjne
npm run build
```

## Migracja z HTML

Aplikacja została zmigrowana z czystego HTML do Angular z następującymi ulepszeniami:

- Wykorzystanie Signals dla reaktywnego UI
- Komponenty standalone (bez NgModules)
- Tailwind CSS zamiast inline styles
- TypeScript dla type safety
- Lepsze rozdzielenie odpowiedzialności
