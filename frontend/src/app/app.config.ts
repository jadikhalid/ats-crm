import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';
import { buildAuthProviders } from '@core/auth/app-auth.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ...buildAuthProviders(),
    provideHttpClient(withInterceptors([tokenInterceptor])),
  ],
};
