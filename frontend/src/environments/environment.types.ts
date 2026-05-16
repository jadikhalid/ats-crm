/** Mode d’auth partagé par `environment.ts` et `environment.prod.ts` pour éviter les erreurs TS « no overlap ». */
export type AuthMode = 'local' | 'entra';

export interface MsalSpaConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string[];
}

/** Discriminants : avec `mode: 'entra'`, la config MSAL est obligatoire. */
export type AppAuthConfig =
  | { mode: 'local'; msal?: undefined }
  | { mode: 'entra'; msal: MsalSpaConfig };

export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
  appName: string;
  auth: AppAuthConfig;
}
