/**
 * Remplacez les chaînes par les valeurs de votre App Registration Azure (SPA + URI de l’API exposée).
 * Le fichier est injecté uniquement lors du build production (`angular.json`).
 */
import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/api',
  appName: 'ESN ATS/CRM',
  auth: {
    mode: 'entra',
    msal: {
      clientId: 'REPLACE_ENTRA_SPA_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/REPLACE_TENANT_GUID/v2.0',
      redirectUri: 'https://REPLACE_ORIGIN_FRONTEND/',
      postLogoutRedirectUri: 'https://REPLACE_ORIGIN_FRONTEND/auth/login',
      scopes: ['api://REPLACE_API_APP_AUDIENCE/.default'],
    },
  },
};
