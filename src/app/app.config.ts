import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { DatabaseService } from './services/database.service';
import { StepMappingService } from './services/step-mapping.service';

import { routes } from './app.routes';

export function initializeApp(dbService: DatabaseService, stepMappingService: StepMappingService) {
  return async () => {
    await dbService.init();
    await stepMappingService.init();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DatabaseService, StepMappingService],
      multi: true,
    },
  ],
};
