import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db: Database | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });

      // Sprawdź czy jest zapisana baza w localStorage
      const savedDb = localStorage.getItem('lego_sqlite_db');
      if (savedDb) {
        const uint8Array = new Uint8Array(
          atob(savedDb)
            .split('')
            .map((c) => c.charCodeAt(0)),
        );
        this.db = new SQL.Database(uint8Array);
        console.log('✅ Załadowano bazę danych z localStorage');
      } else {
        this.db = new SQL.Database();
        this.createTables();
        console.log('📂 Utworzono nową bazę danych');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Błąd inicjalizacji bazy danych:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        current_step INTEGER NOT NULL,
        last_saved TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS step_mapping (
        step_number INTEGER PRIMARY KEY,
        packages TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS selected_packages (
        package_number INTEGER PRIMARY KEY
      )
    `);

    // Wstaw domyślny stan
    this.db.run('INSERT INTO app_state (id, current_step, last_saved) VALUES (1, 1, ?)', [
      new Date().toISOString(),
    ]);

    this.save();
  }

  private save(): void {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const base64 = btoa(String.fromCharCode(...data));
      localStorage.setItem('lego_sqlite_db', base64);
    } catch (error) {
      console.error('❌ Błąd zapisu bazy:', error);
    }
  }

  getCurrentStep(): number {
    if (!this.db) return 1;

    const result = this.db.exec('SELECT current_step FROM app_state WHERE id = 1');
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as number;
    }
    return 1;
  }

  setCurrentStep(step: number): void {
    if (!this.db) return;

    this.db.run('UPDATE app_state SET current_step = ?, last_saved = ? WHERE id = 1', [
      step,
      new Date().toISOString(),
    ]);
    this.save();
  }

  getStepMapping(): Record<number, number[]> {
    if (!this.db) return {};

    const result = this.db.exec('SELECT step_number, packages FROM step_mapping');
    if (result.length === 0) return {};

    const mapping: Record<number, number[]> = {};
    result[0].values.forEach((row: any[]) => {
      const step = row[0] as number;
      const packages = JSON.parse(row[1] as string) as number[];
      mapping[step] = packages;
    });

    return mapping;
  }

  setStepMapping(step: number, packages: number[]): void {
    if (!this.db) return;

    this.db.run('INSERT OR REPLACE INTO step_mapping (step_number, packages) VALUES (?, ?)', [
      step,
      JSON.stringify(packages),
    ]);
    this.save();
  }

  deleteStepMapping(step: number): void {
    if (!this.db) return;

    this.db.run('DELETE FROM step_mapping WHERE step_number = ?', [step]);
    this.save();
  }

  getSelectedPackages(): number[] {
    if (!this.db) return [];

    const result = this.db.exec(
      'SELECT package_number FROM selected_packages ORDER BY package_number',
    );
    if (result.length === 0) return [];

    return result[0].values.map((row: any[]) => row[0] as number);
  }

  setSelectedPackages(packages: number[]): void {
    if (!this.db) return;

    this.db.run('DELETE FROM selected_packages');
    packages.forEach((pkg) => {
      this.db!.run('INSERT INTO selected_packages (package_number) VALUES (?)', [pkg]);
    });
    this.save();
  }

  clearSelectedPackages(): void {
    if (!this.db) return;

    this.db.run('DELETE FROM selected_packages');
    this.save();
  }

  exportDatabase(): void {
    if (!this.db) return;

    const data = this.db.export();
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lego_mapowanie_${new Date().toISOString().split('T')[0]}.db`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getLastSaved(): string | null {
    if (!this.db) return null;

    const result = this.db.exec('SELECT last_saved FROM app_state WHERE id = 1');
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as string;
    }
    return null;
  }
}
