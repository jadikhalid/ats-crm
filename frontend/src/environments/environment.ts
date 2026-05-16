import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: '/api',
  appName: 'ESN ATS/CRM',
  auth: {
    mode: 'local',
    msal: undefined,
  },
};
