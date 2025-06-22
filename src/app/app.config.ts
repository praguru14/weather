import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
// import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(appRoutes),provideHttpClient(),provideCharts(withDefaultRegisterables()) ]
};
