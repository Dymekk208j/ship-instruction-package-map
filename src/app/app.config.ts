import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { DatabaseService } from './services/database.service';

import { routes } from './app.routes';

export function initializeDatabase(dbService: DatabaseService) {
  return () => dbService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDatabase,
      deps: [DatabaseService],
      multi: true,
    },
  ],
};
