import { APP_INITIALIZER, Provider } from '@angular/core';
import { MSAL_INSTANCE, MsalService } from '@azure/msal-angular';

import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth.service';
import { msalBrowserInstanceFactory } from './msal-instance.factory';
import { LocalTokenBearer } from './local-token.bearer';
import { MsalTokenBearer } from './msal-token.bearer';
import { TOKEN_BEARER } from './token-bearer';

export function buildAuthProviders(): Provider[] {
  if (environment.auth.mode !== 'entra') {
    return [{ provide: TOKEN_BEARER, useClass: LocalTokenBearer }];
  }
  const msalInputs = environment.auth.msal;

  return [
    {
      provide: MSAL_INSTANCE,
      useFactory: () =>
        msalBrowserInstanceFactory({
          clientId: msalInputs.clientId,
          authority: msalInputs.authority,
          redirectUri: msalInputs.redirectUri,
          postLogoutRedirectUri: msalInputs.postLogoutRedirectUri,
        }),
    },
    MsalService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [MsalService],
      useFactory:
        (msal: MsalService) =>
        (): Promise<void> =>
          msal.instance
            .initialize()
            .then(() => msal.instance.handleRedirectPromise())
            .then(() => {
              /* void */
            }),
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthService],
      useFactory: (auth: AuthService) => (): Promise<void> => auth.hydrateAfterOAuthRedirect(),
    },
    { provide: TOKEN_BEARER, useClass: MsalTokenBearer },
  ];
}
