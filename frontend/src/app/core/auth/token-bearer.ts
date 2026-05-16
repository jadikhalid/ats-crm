import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** Fournit le jeton OAuth porteur pour l’intercepteur HTTP (JWT local ou access token MSAL). */
export interface TokenBearer {
  getBearerToken$(): Observable<string | null>;
}

export const TOKEN_BEARER = new InjectionToken<TokenBearer>('TOKEN_BEARER');
