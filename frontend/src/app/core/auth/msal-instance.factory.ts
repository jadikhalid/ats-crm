import { IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';

export function msalBrowserInstanceFactory(auth: AppMsalInputs): IPublicClientApplication {
  const logLevel =
    typeof window !== 'undefined' &&
    '__LOG_MSAL_DEV__' in window &&
    (window as Window & { __LOG_MSAL_DEV__?: unknown }).__LOG_MSAL_DEV__
      ? LogLevel.Verbose
      : LogLevel.Error;

  return new PublicClientApplication({
    auth: {
      clientId: auth.clientId,
      authority: auth.authority,
      redirectUri: auth.redirectUri,
      postLogoutRedirectUri: auth.postLogoutRedirectUri ?? auth.redirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
    },
    system: {
      loggerOptions: { logLevel, piiLoggingEnabled: false },
    },
  });
}

export interface AppMsalInputs {
  clientId: string;
  authority: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
}
