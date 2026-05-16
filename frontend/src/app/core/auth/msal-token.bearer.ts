import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '@env/environment';
import type { TokenBearer } from './token-bearer';

/**
 * Bearer token via MSAL silent (access token pour le Resource Server ATS).
 */
@Injectable()
export class MsalTokenBearer implements TokenBearer {
  private readonly msal = inject(MsalService);

  getBearerToken$(): Observable<string | null> {
    if (environment.auth.mode !== 'entra') {
      return of(null);
    }
    const cfg = environment.auth.msal;
    const account = this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts().at(0) ?? null;
    if (!account) {
      return of(null);
    }
    const request = { scopes: cfg.scopes, account };

    return from(this.msal.instance.acquireTokenSilent(request)).pipe(
      map((r) => r.accessToken),
      catchError((err) => {
        if (err instanceof InteractionRequiredAuthError) {
          void this.msal.instance.acquireTokenRedirect(request);
          return of(null);
        }
        return of(null);
      }),
    );
  }
}
