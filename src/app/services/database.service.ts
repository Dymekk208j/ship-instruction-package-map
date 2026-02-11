import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private supabase: SupabaseClient;
  private initialized = false;
  private userId: string = 'default_user'; // W produkcji użyj prawdziwej autentykacji

  constructor() {
    // Supabase configuration - wyciągnięte z connection string
    const supabaseUrl = 'https://kizsruvrwfbqtajbndop.supabase.co';
    const supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpenNydXZyd2ZicXRhamJuZG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjEzNTAsImV4cCI6MjA4NjM5NzM1MH0.RLw5z96JlQqpqXxxS2NxW9BPz2uV7iBhvnYRWtvERvU'; // TODO: Zamień na prawdziwy anon key z Supabase dashboard

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.createTablesIfNeeded();
      await this.ensureUserState();
      this.initialized = true;
      console.log('✅ Połączono z Supabase');
    } catch (error) {
      console.error('❌ Błąd inicjalizacji Supabase:', error);
      throw error;
    }
  }

  private async createTablesIfNeeded(): Promise<void> {
    // Tabele powinny być utworzone przez Supabase SQL Editor:
    /*
    CREATE TABLE IF NOT EXISTS app_state (
      user_id TEXT PRIMARY KEY,
      current_step INTEGER NOT NULL,
      last_saved TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS step_mapping (
      user_id TEXT NOT NULL,
      step_number INTEGER NOT NULL,
      packages JSONB NOT NULL,
      PRIMARY KEY (user_id, step_number)
    );

    CREATE TABLE IF NOT EXISTS selected_packages (
      user_id TEXT NOT NULL,
      package_number INTEGER NOT NULL,
      PRIMARY KEY (user_id, package_number)
    );
    */
  }

  private async ensureUserState(): Promise<void> {
    const { data, error } = await this.supabase
      .from('app_state')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!data && !error) {
      // Utwórz domyślny stan
      await this.supabase.from('app_state').insert({
        user_id: this.userId,
        current_step: 1,
        last_saved: new Date().toISOString(),
      });
    }
  }

  getCurrentStep(): number {
    // Metoda synchroniczna - użyj getStepAsync() dla właściwego ładowania
    return 1;
  }

  async getCurrentStepAsync(): Promise<number> {
    const { data, error } = await this.supabase
      .from('app_state')
      .select('current_step')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) return 1;
    return data.current_step;
  }

  async setCurrentStep(step: number): Promise<void> {
    await this.supabase
      .from('app_state')
      .update({
        current_step: step,
        last_saved: new Date().toISOString(),
      })
      .eq('user_id', this.userId);
  }

  getStepMapping(): Record<number, number[]> {
    // Metoda synchroniczna - użyj getStepMappingAsync() dla właściwego ładowania
    return {};
  }

  async getStepMappingAsync(): Promise<Record<number, number[]>> {
    const { data, error } = await this.supabase
      .from('step_mapping')
      .select('step_number, packages')
      .eq('user_id', this.userId);

    if (error || !data) return {};

    const mapping: Record<number, number[]> = {};
    data.forEach((row: any) => {
      mapping[row.step_number] = row.packages;
    });

    return mapping;
  }

  async setStepMapping(step: number, packages: number[]): Promise<void> {
    await this.supabase.from('step_mapping').upsert(
      {
        user_id: this.userId,
        step_number: step,
        packages: packages,
      },
      { onConflict: 'user_id,step_number' },
    );
  }

  async deleteStepMapping(step: number): Promise<void> {
    await this.supabase
      .from('step_mapping')
      .delete()
      .eq('user_id', this.userId)
      .eq('step_number', step);
  }

  getSelectedPackages(): number[] {
    // Metoda synchroniczna - użyj getSelectedPackagesAsync() dla właściwego ładowania
    return [];
  }

  async getSelectedPackagesAsync(): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('selected_packages')
      .select('package_number')
      .eq('user_id', this.userId)
      .order('package_number');

    if (error || !data) return [];

    return data.map((row: any) => row.package_number);
  }

  async setSelectedPackages(packages: number[]): Promise<void> {
    // Usuń wszystkie istniejące
    await this.supabase.from('selected_packages').delete().eq('user_id', this.userId);

    // Wstaw nowe
    if (packages.length > 0) {
      const rows = packages.map((pkg) => ({
        user_id: this.userId,
        package_number: pkg,
      }));
      await this.supabase.from('selected_packages').insert(rows);
    }
  }

  async clearSelectedPackages(): Promise<void> {
    await this.supabase.from('selected_packages').delete().eq('user_id', this.userId);
  }

  async exportDatabase(): Promise<void> {
    // Eksport wszystkich danych jako JSON
    const [appState, stepMapping, selectedPackages] = await Promise.all([
      this.supabase.from('app_state').select('*').eq('user_id', this.userId),
      this.supabase.from('step_mapping').select('*').eq('user_id', this.userId),
      this.supabase.from('selected_packages').select('*').eq('user_id', this.userId),
    ]);

    const exportData = {
      app_state: appState.data,
      step_mapping: stepMapping.data,
      selected_packages: selectedPackages.data,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lego_mapowanie_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getLastSaved(): string | null {
    // Metoda synchroniczna - użyj getLastSavedAsync() dla właściwego ładowania
    return null;
  }

  async getLastSavedAsync(): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('app_state')
      .select('last_saved')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) return null;
    return data.last_saved;
  }
}
