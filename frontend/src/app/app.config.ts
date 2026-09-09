import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient} from '@angular/common/http';
import { routes } from './app.routes';

// central setup of the app: everything listed here is available in every component
export const appConfig: ApplicationConfig = {
  providers: [
    // logs errors that nobody catches, added by the generator
    provideBrowserGlobalErrorListeners(),
    // turns on routing and hands over our route table from app.routes.ts
    provideRouter(routes),
    // turns on HttpClient, forced to the classic XMLHttpRequest backend
    // instead of Angular 22's new default (fetch), which zone.js tracks unreliably
    provideHttpClient(),
  ],
};
